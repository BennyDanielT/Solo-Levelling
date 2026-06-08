"""
Chat Service - Orchestrates conversation flow
Manages user context, thread lifecycle, and Azure agent interactions
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from loguru import logger
import json
import asyncio

from database import users_collection
from llm_service import llm_service
from goal_service import GoalService
from services.thread_service import ThreadService
from agent_tools import set_user_email, get_user_email


class ChatService:
    """Service for handling chat conversations with context and persistence"""
    
    @staticmethod
    async def handle_message(user_email: str, message: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user message through the conversation pipeline.
        
        Steps:
        1. Get or create user thread (use provided thread_id if available)
        2. Set user context for agent tools
        3. Call Azure AI Agent with message
        4. Extract response and events
        5. Return structured response to client
        
        Args:
            user_email: User's email (resolved from auth)
            message: User's message
            thread_id: Optional thread ID - if provided, use that thread; otherwise use/create default
            
        Returns:
            {
                "reply": str,           # The assistant's response text
                "thread_id": str,       # Azure thread ID for persistence
                "events": List[Dict],   # Side effects (goal created, metric logged, etc)
                "metadata": Dict,       # Additional context
            }
        """
        try:
            logger.info(f"💬 [CHAT] Processing message from {user_email}")

            # Step 0: Guarantee the user document exists BEFORE the AI runs.
            # Without this, create_goal's own auto-create could produce a second
            # user document with a different _id, causing goals to appear under a
            # different userId than the one the UI queries by.
            await GoalService._ensure_user_exists(user_email)

            # Step 1: Get or create user's persistent thread
            if thread_id:
                # Use provided thread_id (MongoDB thread record ID)
                thread_record_id = thread_id
                logger.info(f"📌 [CHAT] Using provided thread: {thread_record_id}")
            else:
                # Get or create default user thread
                thread_record_id = await ThreadService.get_or_create_user_thread(user_email)
                logger.info(f"📌 [CHAT] Using thread: {thread_record_id}")
            
            # Get the Azure thread ID from the thread record
            thread_record = await ThreadService.get_thread_record(thread_record_id)
            azure_thread_id = thread_record.get("threadId") if thread_record else None
            logger.info(f"🔗 [CHAT] Azure thread ID: {azure_thread_id}")
            
            # Step 2: Get user context for better responses
            user_context = await ChatService._get_user_context(user_email)
            
            # Step 3: Build enriched message with context
            enriched_message = await ChatService._build_enriched_message(
                user_email, message, user_context
            )
            
            # Step 4: Set user context for agent tools (thread-local storage)
            set_user_email(user_email)
            
            # Step 5: Call Azure AI Agent with existing thread ID
            logger.info(f"🤖 [CHAT] Calling Azure agent for: {user_email}")
            response = await llm_service.chat_with_agent(
                message=enriched_message,
                user_email=user_email,
                thread_id=azure_thread_id  # Pass existing Azure thread ID
            )
            
            logger.info(f"✅ [CHAT] Got response from agent")
            
            # Store the Azure thread ID in the record if it's new
            if not azure_thread_id:
                await ThreadService.set_azure_thread_id(thread_record_id, response.get("thread_id"))
            
            # Step 6: Extract events from response (e.g., "goal_created", "metric_logged")
            events = await ChatService._extract_events(response, user_email)
            
            # Step 7: Format response for client
            result = {
                "reply": response.get("text", ""),
                "thread_id": response.get("thread_id", thread_record_id),
                "events": events,
                "metadata": {
                    "user_level": user_context.get("level", 1),
                    "user_rank": user_context.get("rank", "E"),
                    "active_goals_count": len(user_context.get("active_goals", []))
                }
            }
            
            logger.info(f"✅ [CHAT] Response prepared for {user_email}")
            return result
        
        except Exception as e:
            logger.error(f"❌ [CHAT] Error handling message: {e}")
            raise
    
    @staticmethod
    async def _get_user_context(user_email: str) -> Dict[str, Any]:
        """Gather user context for better agent responses and function calling."""
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {}
            
            # Get active goals for context
            goals_result = await GoalService.get_user_goals(user_email)
            active_goals = []
            if goals_result.get("success"):
                active_goals = [g for g in goals_result.get("data", []) 
                               if not g.get("completed", False)][:5]
            
            return {
                "user_id": str(user["_id"]),
                "name": user.get("name", "User"),
                "level": user.get("level", 1),
                "rank": user.get("rank", "E"),
                "title": user.get("title", "Awakened Hunter"),
                "total_points": user.get("totalPoints", 0),
                "active_goals": active_goals,
                "preferences": user.get("preferences", {})
            }
        except Exception as e:
            logger.error(f"❌ Error getting user context: {e}")
            return {}
    
    @staticmethod
    async def _build_enriched_message(
        user_email: str,
        message: str,
        user_context: Dict[str, Any]
    ) -> str:
        """Build a message enriched with user context for the agent."""
        context_str = f"""
[USER CONTEXT]
Name: {user_context.get('name', 'User')}
Level: {user_context.get('level', 1)}
Rank: {user_context.get('rank', 'E')}
Title: {user_context.get('title', 'Awakened Hunter')}
Total XP: {user_context.get('total_points', 0)}

Active Goals: {len(user_context.get('active_goals', []))}
"""
        
        if user_context.get('active_goals'):
            context_str += "Current Goals:\n"
            for goal in user_context.get('active_goals', [])[:3]:
                progress = goal.get('progress', 0)
                context_str += f"  - {goal.get('title')} ({goal.get('category', 'personal')}) - {progress}% complete\n"
        
        return f"{context_str}\n[USER MESSAGE]\n{message}"
    
    @staticmethod
    async def _extract_events(response: Dict, user_email: str) -> List[Dict]:
        """
        Extract side-effect events from the agent response.
        E.g., if the agent created a goal, capture that event.
        """
        events = []
        
        try:
            # Parse response for structured events
            # This is where you'd detect if the agent called tools
            # Example: if response contains "goal_created", add an event
            
            if "goal_created" in response.get("text", "").lower():
                events.append({
                    "type": "goal_created",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            if "goal_updated" in response.get("text", "").lower():
                events.append({
                    "type": "goal_updated",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            logger.info(f"📊 [CHAT] Extracted {len(events)} events from response")
        
        except Exception as e:
            logger.error(f"⚠️  Error extracting events: {e}")
        
        return events
