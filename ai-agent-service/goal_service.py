"""
Goal Service - Shared business logic for goals
Used by both FastAPI endpoints and AI agent tools
"""
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger
from database import users_collection, goals_collection


class GoalService:
    """Service for goal-related operations"""
    
    @staticmethod
    async def get_user_goals(user_email: str) -> Dict:
        """
        Get all goals for a user by email
        
        Args:
            user_email: User's email address
            
        Returns:
            Dict with success status and goals data
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            goals_cursor = goals_collection.find({"userId": str(user["_id"])}).sort("createdAt", -1)
            goals = await goals_cursor.to_list(length=100)
            
            # Convert ObjectId to string
            for goal in goals:
                goal["id"] = str(goal.pop("_id"))
            
            return {"success": True, "data": goals}
        except Exception as e:
            logger.error(f"Error getting user goals: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def create_goal(
        user_email: str,
        title: str,
        description: str = "",
        category: str = "personal",
        priority: str = "medium",
        target_date: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Dict:
        """
        Create a new goal for a user
        
        Args:
            user_email: User's email address
            title: Goal title
            description: Goal description
            category: Goal category
            priority: Goal priority (low, medium, high)
            target_date: Target completion date
            tags: List of tags
            
        Returns:
            Dict with success status and created goal data
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            goal_doc = {
                "title": title,
                "description": description,
                "category": category,
                "priority": priority,
                "targetDate": target_date,
                "status": "active",
                "progress": 0,
                "tags": tags or [],
                "userId": str(user["_id"]),
                "completed": False,
                "createdAt": datetime.utcnow(),
                "completedAt": None,
                "updatedAt": datetime.utcnow()
            }
            
            result = await goals_collection.insert_one(goal_doc)
            goal_doc["id"] = str(result.inserted_id)
            goal_doc.pop("_id", None)
            
            return {
                "success": True,
                "message": "Goal created successfully",
                "data": goal_doc
            }
        except Exception as e:
            logger.error(f"Error creating goal: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def update_goal(user_email: str, goal_id: str, update_data: Dict) -> Dict:
        """
        Update a goal
        
        Args:
            user_email: User's email address
            goal_id: Goal ID
            update_data: Dict of fields to update
            
        Returns:
            Dict with success status and message
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            goal = await goals_collection.find_one({
                "_id": ObjectId(goal_id),
                "userId": str(user["_id"])
            })
            
            if not goal:
                return {"success": False, "error": "Goal not found"}
            
            # Prepare update
            goal_update = {"updatedAt": datetime.utcnow()}
            
            # Handle status/completed changes
            if "status" in update_data:
                goal_update["status"] = update_data["status"]
                if update_data["status"] == "completed":
                    goal_update["completed"] = True
                    goal_update["completedAt"] = datetime.utcnow()
                    goal_update["progress"] = 100
            
            if "completed" in update_data and update_data["completed"]:
                goal_update["completed"] = True
                goal_update["completedAt"] = datetime.utcnow()
                goal_update["status"] = "completed"
                goal_update["progress"] = 100
            
            # Handle progress updates
            if "progress" in update_data:
                goal_update["progress"] = min(100, max(0, update_data["progress"]))
                if goal_update["progress"] == 100 and not goal.get("completed"):
                    goal_update["completed"] = True
                    goal_update["completedAt"] = datetime.utcnow()
                    goal_update["status"] = "completed"
            
            # Update other fields if provided
            for field in ["title", "description", "category", "priority", "targetDate", "tags"]:
                if field in update_data:
                    goal_update[field] = update_data[field]
            
            await goals_collection.update_one(
                {"_id": ObjectId(goal_id)},
                {"$set": goal_update}
            )
            
            return {"success": True, "message": "Goal updated successfully"}
        except Exception as e:
            logger.error(f"Error updating goal: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def delete_goal(user_email: str, goal_id: str) -> Dict:
        """
        Delete a goal
        
        Args:
            user_email: User's email address
            goal_id: Goal ID
            
        Returns:
            Dict with success status and message
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            result = await goals_collection.delete_one({
                "_id": ObjectId(goal_id),
                "userId": str(user["_id"])
            })
            
            if result.deleted_count == 0:
                return {"success": False, "error": "Goal not found"}
            
            return {"success": True, "message": "Goal deleted successfully"}
        except Exception as e:
            logger.error(f"Error deleting goal: {e}")
            return {"success": False, "error": str(e)}
