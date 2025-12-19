"""
User API - Endpoints for user profile and metrics
"""
from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from auth import get_current_user
from services.user_service import UserService


# Router
router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile with stats."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        result = await UserService.get_user_profile(user_email)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {"success": True, "data": result["data"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [USER_API] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):
    """Get dashboard metrics (goals progress, completion rates, etc)."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        result = await UserService.get_dashboard_metrics(user_email)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {"success": True, "data": result["data"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [USER_API] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
