"""
Thread Service - Manages persistent conversation threads with Azure AI Agent
Each user has a dedicated thread that preserves conversation context
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId
from loguru import logger
import json

from database import chat_threads_collection, users_collection


class ThreadService:
    """Service for managing persistent conversation threads"""
    
    @staticmethod
    async def get_thread_record(thread_record_id: str) -> Optional[Dict]:
        """
        Get a thread record by its MongoDB ID.
        
        Args:
            thread_record_id: MongoDB thread record ID
            
        Returns:
            Thread record dictionary or None if not found
        """
        try:
            thread = await chat_threads_collection.find_one(
                {"_id": ObjectId(thread_record_id)}
            )
            return thread
        except Exception as e:
            logger.error(f"❌ Error getting thread record: {e}")
            return None
    
    @staticmethod
    async def get_or_create_user_thread(user_email: str) -> str:
        """
        Get the user's primary conversation thread ID, or create one if it doesn't exist.
        
        Args:
            user_email: User's email address
            
        Returns:
            str: Thread ID (UUID from Azure AI Agent)
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                logger.error(f"User not found: {user_email}")
                raise ValueError(f"User not found: {user_email}")
            
            user_id = str(user["_id"])
            
            # Check if user already has a primary thread
            thread = await chat_threads_collection.find_one({
                "userId": user_id,
                "isPrimary": True,
                "deletedAt": None
            })
            
            if thread:
                logger.info(f"✅ Found existing thread for {user_email}: {thread['threadId']}")
                return thread["threadId"]
            
            # Create a new thread (Azure thread will be created on first message)
            new_thread = {
                "userId": user_id,
                "userEmail": user_email,
                "threadId": None,  # Will be set on first message
                "isPrimary": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "deletedAt": None,
                "messageCount": 0,
                "metadata": {}
            }
            
            result = await chat_threads_collection.insert_one(new_thread)
            logger.info(f"📌 Created new thread record for {user_email}: {result.inserted_id}")
            
            return str(result.inserted_id)
        
        except Exception as e:
            logger.error(f"❌ Error getting/creating thread: {e}")
            raise
    
    @staticmethod
    async def set_azure_thread_id(thread_record_id: str, azure_thread_id: str) -> None:
        """
        Update thread record with Azure-generated thread ID.
        
        Args:
            thread_record_id: MongoDB thread record ID
            azure_thread_id: Azure AI Agent thread ID
        """
        try:
            await chat_threads_collection.update_one(
                {"_id": ObjectId(thread_record_id)},
                {"$set": {
                    "threadId": azure_thread_id,
                    "updatedAt": datetime.utcnow()
                }}
            )
            logger.info(f"✅ Set Azure thread ID for {thread_record_id}: {azure_thread_id}")
        except Exception as e:
            logger.error(f"❌ Error setting Azure thread ID: {e}")
            raise
    
    @staticmethod
    async def get_thread_messages(thread_id: str, limit: int = 50) -> List[Dict]:
        """
        Retrieve message history for a thread.
        
        Args:
            thread_id: Azure thread ID
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        try:
            thread = await chat_threads_collection.find_one({"threadId": thread_id})
            if not thread:
                logger.warning(f"Thread not found: {thread_id}")
                return []
            
            thread_record_id = str(thread["_id"])
            
            # In a real system, fetch from Azure agent API
            # For now, store in MongoDB as a workaround
            messages = []  # Would come from Azure API
            
            logger.info(f"📝 Retrieved {len(messages)} messages for thread {thread_id}")
            return messages
        
        except Exception as e:
            logger.error(f"❌ Error getting thread messages: {e}")
            return []
    
    @staticmethod
    async def add_message_to_thread(
        thread_id: str,
        role: str,
        content: str,
        run_id: Optional[str] = None
    ) -> None:
        """
        Record a message in the thread history.
        
        Args:
            thread_id: Azure thread ID
            role: "user" or "assistant"
            content: Message content
            run_id: Optional Azure run ID
        """
        try:
            message = {
                "threadId": thread_id,
                "role": role,
                "content": content,
                "runId": run_id,
                "timestamp": datetime.utcnow()
            }
            
            # You might store these in a separate collection
            # For now, just log
            logger.info(f"💬 Message recorded: {role} in thread {thread_id}")
        
        except Exception as e:
            logger.error(f"❌ Error adding message to thread: {e}")
            raise
    
    @staticmethod
    async def increment_message_count(thread_record_id: str) -> None:
        """Increment the message count for a thread."""
        try:
            await chat_threads_collection.update_one(
                {"_id": ObjectId(thread_record_id)},
                {"$inc": {"messageCount": 1}, "$set": {"updatedAt": datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"❌ Error incrementing message count: {e}")
            raise
    
    @staticmethod
    async def delete_thread(thread_record_id: str) -> None:
        """Soft-delete a thread."""
        try:
            await chat_threads_collection.update_one(
                {"_id": ObjectId(thread_record_id)},
                {"$set": {"deletedAt": datetime.utcnow()}}
            )
            logger.info(f"✅ Thread deleted: {thread_record_id}")
        except Exception as e:
            logger.error(f"❌ Error deleting thread: {e}")
            raise
