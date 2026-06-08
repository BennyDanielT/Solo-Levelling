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
            
            # Clean empty SP env variables so DefaultAzureCredential doesn't fail
            for key in ["AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET"]:
                if os.environ.get(key) == "":
                    del os.environ[key]

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
    
    def _execute_responses_create(self, openai_client, conversation_id: str, input_val: Any, agent_id: str) -> Any:
        """
        Executes the responses.create loop to handle any local function tool executions.
        """
        from agent_tools import (
            get_stock_history, 
            get_user_goals, 
            create_goal, 
            delete_goal, 
            update_goal,
            get_news_by_category
        )
        
        function_map = {
            "get_stock_history": get_stock_history,
            "get_user_goals": get_user_goals,
            "create_goal": create_goal,
            "delete_goal": delete_goal,
            "update_goal": update_goal,
            "get_news_by_category": get_news_by_category
        }
        
        agent_version = "6"
        
        response = openai_client.responses.create(
            conversation=conversation_id,
            input=input_val,
            extra_body={"agent_reference": {"name": agent_id, "version": agent_version, "type": "agent_reference"}},
        )
        
        # Loop to handle function calls
        while any(item.type == "function_call" for item in response.output):
            tool_outputs = []
            for item in response.output:
                if item.type == "function_call":
                    func_name = item.name
                    func_args_str = item.arguments
                    call_id = item.call_id
                    
                    logger.info(f"🔧 [LLM_SERVICE] Agent requested tool call: {func_name} with arguments: {func_args_str}")
                    
                    # Load arguments
                    try:
                        args = json.loads(func_args_str) if func_args_str else {}
                    except Exception as e:
                        logger.error(f"❌ Failed to parse arguments JSON: {e}")
                        args = {}
                    
                    # Execute local function
                    if func_name in function_map:
                        try:
                            # Call function with unpacked arguments
                            result = function_map[func_name](**args)
                        except Exception as e:
                            logger.error(f"💥 Failed executing local function {func_name}: {e}")
                            result = json.dumps({"success": False, "error": str(e)})
                    else:
                        logger.error(f"❌ Unknown function requested by agent: {func_name}")
                        result = json.dumps({"success": False, "error": f"Function {func_name} not found"})
                    
                    logger.info(f"✅ [LLM_SERVICE] Tool execution completed. Result length: {len(result)}")
                    tool_outputs.append({
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": result
                    })
                    
            # Send results back
            response = openai_client.responses.create(
                conversation=conversation_id,
                input=tool_outputs,
                extra_body={"agent_reference": {"name": agent_id, "version": agent_version, "type": "agent_reference"}}
            )
            
        return response

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
            agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
            if not agent_id:
                raise Exception("AZURE_EXISTING_AGENT_ID not configured.")
            
            logger.info(f"🤖 Using agent: {agent_id}")
            
            from agent_tools import set_user_email
            import nest_asyncio
            nest_asyncio.apply()
            
            # Set user email in context for agent tools
            if user_email:
                set_user_email(user_email)
                logger.info(f"📧 User email set for agent tools: {user_email}")
            else:
                logger.warning("⚠️ No user email provided - goal/user functions may fail")
            
            openai_client = self.project_client.get_openai_client()
            
            # Create a temporary conversation for stateless turn
            conversation = openai_client.conversations.create()
            logger.info(f"📝 Temporary Conversation Created: {conversation.id}")
            
            # Combine all messages into a clean format
            combined_input = ""
            for msg in messages:
                combined_input += f"[{msg['role'].upper()}]\n{msg['content']}\n\n"
            
            # Run the agent response loop
            response = self._execute_responses_create(
                openai_client=openai_client,
                conversation_id=conversation.id,
                input_val=combined_input,
                agent_id=agent_id
            )
            
            response_text = response.output_text
            if not response_text:
                raise Exception("No assistant response found")
                
            return response_text
            
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
            thread_id: Optional existing Azure conversation ID (acted as thread ID)
        
        Returns:
            {
                "text": str,           # Assistant response
                "thread_id": str,      # Azure conversation ID for next message
                "events": List[Dict],  # Function call events
            }
        """
        if self.provider != "azure" or not self.project_client:
            raise Exception("Azure provider not initialized")
        
        try:
            from agent_tools import set_user_email
            import nest_asyncio
            nest_asyncio.apply()
            
            # Set user context for agent tools
            set_user_email(user_email)
            logger.info(f"📧 [AGENT] User context set: {user_email}")
            
            agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
            if not agent_id:
                raise Exception("AZURE_EXISTING_AGENT_ID not configured")
            
            openai_client = self.project_client.get_openai_client()
            
            # Get or create conversation (mapping thread_id directly to Azure conversation.id)
            if thread_id:
                azure_thread_id = thread_id
                logger.info(f"📌 [AGENT] Using existing conversation ID: {azure_thread_id}")
            else:
                conversation = openai_client.conversations.create()
                azure_thread_id = conversation.id
                logger.info(f"📌 [AGENT] Created new conversation ID: {azure_thread_id}")
            
            # Run the agent response loop
            response = self._execute_responses_create(
                openai_client=openai_client,
                conversation_id=azure_thread_id,
                input_val=message,
                agent_id=agent_id
            )
            
            response_text = response.output_text
            if not response_text:
                raise Exception("No assistant response found")
            
            logger.info(f"📝 [AGENT] Response: {response_text[:100]}...")
            
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