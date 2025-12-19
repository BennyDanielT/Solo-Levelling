"""
LLM Service for Solo Levelling
Supports both Azure AI Foundry and Ollama
"""
import os
import json
import time
from typing import Optional, List, Dict, Any
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.ai.agents.models import ListSortOrder, FunctionTool
from loguru import logger
import aiohttp
import asyncio


class LLMService:
    """Unified LLM service supporting Azure AI Foundry and Ollama"""
    
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "azure")  # 'azure' or 'ollama'
        self.project_client = None
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.auto_function_calls_enabled = False
        
        # Initialize based on provider
        if self.provider == "azure":
            self._init_azure()
        else:
            self._init_ollama()
    
    def _init_azure(self):
        """Initialize Azure AI Foundry project client"""
        try:
            project_endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
            
            if not project_endpoint:
                logger.warning("AZURE_AI_PROJECT_ENDPOINT not set")
                return
            
            # Check for Service Principal credentials
            tenant_id = os.getenv("AZURE_TENANT_ID")
            client_id = os.getenv("AZURE_CLIENT_ID")
            client_secret = os.getenv("AZURE_CLIENT_SECRET")
            
            if tenant_id and client_id and client_secret:
                credential = ClientSecretCredential(
                    tenant_id=tenant_id,
                    client_id=client_id,
                    client_secret=client_secret
                )
                logger.info("✅ Using Service Principal auth")
            else:
                credential = DefaultAzureCredential()
                logger.info("✅ Using DefaultAzureCredential")
            
            self.project_client = AIProjectClient(
                endpoint=project_endpoint,
                credential=credential
            )
            logger.info(f"✅ Azure AI project client initialized: {project_endpoint}")
                
        except Exception as e:
            logger.error(f"❌ Azure init failed: {e}")
    
    def _init_ollama(self):
        """Initialize Ollama connection"""
        logger.info(f"🦙 Ollama configured at {self.ollama_base_url} with model {self.ollama_model}")
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        user_id: Optional[str] = None,
        system_prompt: Optional[str] = None,
        user_email: Optional[str] = None
    ) -> str:
        """
        Send a chat request to the configured LLM provider
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            user_id: Optional user ID for context
            system_prompt: Optional system prompt to prepend
            user_email: User email for function calls
        
        Returns:
            Response text from the LLM
        """
        if self.provider == "azure":
            return await self._chat_azure(messages, user_id, system_prompt, user_email)
        else:
            return await self._chat_ollama(messages, system_prompt)
    
    async def _chat_azure(
        self,
        messages: List[Dict[str, str]],
        user_id: Optional[str],
        system_prompt: Optional[str],
        user_email: Optional[str]
    ) -> str:
        """Chat using Azure AI Foundry agents"""
        if not self.project_client:
            raise Exception("Azure project client not initialized")
        
        try:
            # Use existing agent (configured in Azure AI Foundry portal)
            agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
            if not agent_id:
                raise Exception("AZURE_EXISTING_AGENT_ID not configured. Please create an agent in Azure AI Foundry.")
            
            logger.info(f"🤖 Using agent: {agent_id}")
            
            # Import tool functions from agent_tools
            from agent_tools import (
                get_stock_history, 
                get_user_goals, 
                create_goal, 
                delete_goal, 
                get_news_by_category,
                set_user_email
            )
            import nest_asyncio
            nest_asyncio.apply()
            
            # Set user email in thread context for agent tools to access
            if user_email:
                set_user_email(user_email)
                logger.info(f"📧 User email set for agent tools: {user_email}")
            else:
                logger.warning("⚠️ No user email provided - goal/user functions may fail")
            
            # Enable auto function calls with all tools from agent_tools
            logger.info("🔧 Enabling auto function calls with 5 tools...")
            self.project_client.agents.enable_auto_function_calls(
                tools={get_stock_history, get_user_goals, create_goal, delete_goal, get_news_by_category},
                max_retry=5
            )
            
            # Create thread
            thread = self.project_client.agents.threads.create()
            logger.info(f"📝 Thread: {thread.id}")
            
            # Add user messages
            for msg in messages:
                if msg["role"] == "user":
                    self.project_client.agents.messages.create(
                        thread_id=thread.id,
                        role="user",
                        content=msg["content"]
                    )
            
            # Run agent
            logger.info("🏃 Running agent...")
            run = self.project_client.agents.runs.create_and_process(
                thread_id=thread.id,
                agent_id=agent_id
            )
            
            logger.info(f"📊 Run status: {run.status}")
            logger.info(f"   Run ID: {run.id}")
            
            # Check for completion or failure
            if run.status == "failed":
                error = run.last_error.message if run.last_error else "Unknown error"
                logger.error(f"❌ Run failed: {error}")
                raise Exception(f"Agent run failed: {error}")
            
            if run.status == "completed":
                # Get response messages
                msgs = self.project_client.agents.messages.list(
                    thread_id=thread.id,
                    order=ListSortOrder.ASCENDING
                )
                
                # Find assistant response from this run
                for message in reversed(list(msgs)):
                    if message.run_id == run.id and message.text_messages:
                        response = message.text_messages[-1].text.value
                        logger.info(f"✅ Response: {len(response)} chars")
                        return response
                
                raise Exception("No assistant response found")
            
            raise Exception(f"Unexpected run status: {run.status}")
            
        except Exception as e:
            logger.error(f"❌ Azure AI chat error: {e}")
            raise
    
    async def _chat_ollama(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str]
    ) -> str:
        """Chat using Ollama"""
        try:
            # Add system prompt if provided
            if system_prompt:
                messages = [{"role": "system", "content": system_prompt}] + messages
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_base_url}/api/chat",
                    json={
                        "model": self.ollama_model,
                        "messages": messages,
                        "stream": False
                    },
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("message", {}).get("content", "")
                    else:
                        error_text = await response.text()
                        raise Exception(f"Ollama API error: {response.status} - {error_text}")
        
        except Exception as e:
            logger.error(f"❌ Ollama chat error: {e}")
            raise
    
    async def get_embedding(self, text: str) -> List[float]:
        """
        Get text embedding from the configured provider
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector
        """
        if self.provider == "azure":
            return await self._embed_azure(text)
        else:
            return await self._embed_ollama(text)
    
    async def _embed_azure(self, text: str) -> List[float]:
        """Get embedding using Azure OpenAI"""
        # TODO: Implement Azure OpenAI embeddings
        raise NotImplementedError("Azure embeddings not yet implemented")
    
    async def _embed_ollama(self, text: str) -> List[float]:
        """Get embedding using Ollama"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_base_url}/api/embeddings",
                    json={
                        "model": self.ollama_model,
                        "prompt": text
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("embedding", [])
                    else:
                        raise Exception(f"Ollama embedding error: {response.status}")
        except Exception as e:
            logger.error(f"❌ Ollama embedding error: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if the LLM service is healthy"""
        if self.provider == "azure":
            return {
                "provider": "azure",
                "status": "ok" if self.project_client else "not_configured",
                "endpoint": os.getenv("AZURE_AI_PROJECT_ENDPOINT", "not_set"),
                "agent_id": os.getenv("AZURE_EXISTING_AGENT_ID", "not_set")
            }
        else:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.ollama_base_url}/api/tags") as response:
                        if response.status == 200:
                            data = await response.json()
                            return {
                                "provider": "ollama",
                                "status": "ok",
                                "base_url": self.ollama_base_url,
                                "model": self.ollama_model,
                                "available_models": [m["name"] for m in data.get("models", [])]
                            }
            except Exception as e:
                return {
                    "provider": "ollama",
                    "status": "error",
                    "error": str(e)
                        }
    
    async def chat_with_agent(
        self,
        message: str,
        user_email: str,
        thread_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Chat with Azure AI Agent while maintaining conversation context.
        
        Args:
            message: User message (may include enriched context)
            user_email: User's email for context and tool access
            thread_id: Optional existing Azure thread ID
        
        Returns:
            {
                "text": str,           # Assistant response
                "thread_id": str,      # Azure thread ID for next message
                "events": List[Dict],  # Function call events
            }
        """
        if self.provider != "azure" or not self.project_client:
            raise Exception("Azure provider not initialized")
        
        try:
            from agent_tools import (
                get_stock_history,
                get_user_goals,
                create_goal,
                delete_goal,
                get_news_by_category,
                set_user_email
            )
            import nest_asyncio
            nest_asyncio.apply()
            
            # Set user context for agent tools
            set_user_email(user_email)
            logger.info(f"📧 [AGENT] User context set: {user_email}")
            
            agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
            if not agent_id:
                raise Exception("AZURE_EXISTING_AGENT_ID not configured")
            
            # Enable function calls
            logger.info("🔧 [AGENT] Enabling auto function calls")
            self.project_client.agents.enable_auto_function_calls(
                tools={get_stock_history, get_user_goals, create_goal, delete_goal, get_news_by_category},
                max_retry=5
            )
            
            # Get or create thread
            if thread_id:
                azure_thread_id = thread_id
                logger.info(f"📌 [AGENT] Using existing thread: {azure_thread_id}")
            else:
                thread = self.project_client.agents.threads.create()
                azure_thread_id = thread.id
                logger.info(f"📌 [AGENT] Created new thread: {azure_thread_id}")
            
            # Add user message
            self.project_client.agents.messages.create(
                thread_id=azure_thread_id,
                role="user",
                content=message
            )
            logger.info(f"✉️ [AGENT] Message added to thread")
            
            # Run agent
            logger.info("🚀 [AGENT] Running agent...")
            run = self.project_client.agents.runs.create_and_process(
                thread_id=azure_thread_id,
                agent_id=agent_id
            )
            
            logger.info(f"✅ [AGENT] Run completed: {run.status}")
            
            # Check for errors
            if run.status == "failed":
                error_msg = run.last_error.message if run.last_error else "Unknown error"
                logger.error(f"❌ [AGENT] Agent run failed: {error_msg}")
                raise Exception(f"Agent run failed: {error_msg}")
            
            if run.status != "completed":
                raise Exception(f"Unexpected run status: {run.status}")
            
            # Get response messages
            from azure.ai.agents.models import ListSortOrder
            messages_list = self.project_client.agents.messages.list(
                thread_id=azure_thread_id,
                order=ListSortOrder.ASCENDING
            )
            
            # Find most recent assistant response
            response_text = ""
            for msg in reversed(list(messages_list)):
                if msg.run_id == run.id and msg.text_messages:
                    response_text = msg.text_messages[-1].text.value
                    logger.info(f"📝 [AGENT] Response: {response_text[:100]}...")
                    break
            
            if not response_text:
                raise Exception("No assistant response found")
            
            return {
                "text": response_text,
                "thread_id": azure_thread_id,
                "events": []
            }
        
        except Exception as e:
            logger.error(f"❌ [AGENT] Error: {e}")
            raise


# Global LLM service instance
llm_service = LLMService()