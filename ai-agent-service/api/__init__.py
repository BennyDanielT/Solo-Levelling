"""API module - HTTP endpoint handlers"""
from api.chat import router as chat_router
from api.goals import router as goals_router
from api.user import router as user_router

__all__ = ["chat_router", "goals_router", "user_router"]
