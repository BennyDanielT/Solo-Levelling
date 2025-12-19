"""
Chat API - Endpoint for conversation with Azure AI Agent
Handles message ingestion and routing to chat service
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from loguru import logger
from typing import Optional

from auth import get_current_user
from services.chat_service import ChatService


# Request/Response models
class ChatMessageRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None  # Optional: pass existing thread_id to continue conversation


class ChatMessageResponse(BaseModel):
    reply: str
    thread_id: str
    events: list = []
    metadata: dict = {}


# Router
router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message and get a response from the Azure AI Agent.
    
    The conversation is persistent - each user can have multiple threads
    (conversations). Pass thread_id to continue an existing conversation,
    or omit it to use/create the default user thread.
    
    Request body:
    {
        "message": "What goals should I focus on?",
        "thread_id": "optional_thread_id"  # Optional
    }
    
    Response:
    {
        "reply": "Based on your profile...",
        "thread_id": "thread_xyz",
        "events": [{"type": "goal_created", ...}],
        "metadata": {...}
    }
    """
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found in token")
        
        logger.info(f"🤖 [CHAT_API] Message from {user_email}: {request.message[:50]}...")
        if request.thread_id:
            logger.info(f"📌 [CHAT_API] Using thread: {request.thread_id}")
        
        # Process message through chat service with optional thread_id
        response = await ChatService.handle_message(
            user_email, 
            request.message,
            thread_id=request.thread_id
        )
        
        logger.info(f"✅ [CHAT_API] Response prepared for {user_email}")
        
        return ChatMessageResponse(
            reply=response["reply"],
            thread_id=response["thread_id"],
            events=response.get("events", []),
            metadata=response.get("metadata", {})
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [CHAT_API] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
