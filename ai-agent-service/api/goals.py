"""
Goals API - Endpoints for goal management
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from loguru import logger

from auth import get_current_user
from goal_service import GoalService


# Models
class GoalCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "personal"
    priority: Optional[str] = "medium"
    targetDate: Optional[str] = None
    tags: Optional[List[str]] = None


class GoalUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    targetDate: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    completed: Optional[bool] = None


# Router
router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("")
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for the current user."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        result = await GoalService.get_user_goals(user_email)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {"success": True, "data": result["data"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [GOALS_API] Error fetching goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_goal(
    request: GoalCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new goal."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        result = await GoalService.create_goal(
            user_email=user_email,
            title=request.title,
            description=request.description or "",
            category=request.category or "personal",
            priority=request.priority or "medium",
            target_date=request.targetDate,
            tags=request.tags or []
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        return {"success": True, "data": result["data"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [GOALS_API] Error creating goal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{goal_id}")
async def update_goal(
    goal_id: str,
    request: GoalUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a goal."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        update_data = request.dict(exclude_unset=True)
        result = await GoalService.update_goal(user_email, goal_id, update_data)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {"success": True, "data": result["data"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [GOALS_API] Error updating goal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a goal."""
    try:
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        result = await GoalService.delete_goal(user_email, goal_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [GOALS_API] Error deleting goal: {e}")
        raise HTTPException(status_code=500, detail=str(e))
