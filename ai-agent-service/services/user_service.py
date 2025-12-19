"""
User Service - Manages user profile, metrics, and preferences
Encapsulates all user-related business logic
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId
from loguru import logger

from database import users_collection, goals_collection, achievements_collection


class UserService:
    """Service for user profile and metrics operations"""
    
    @staticmethod
    async def get_user_profile(user_email: str) -> Dict:
        """
        Get complete user profile including stats.
        
        Returns:
            {
                "id": str,
                "name": str,
                "email": str,
                "level": int,
                "rank": str,
                "totalPoints": int,
                "stats": {...}
            }
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            user_id = str(user["_id"])
            
            # Count goals and achievements
            total_goals = await goals_collection.count_documents({"userId": user_id})
            completed_goals = await goals_collection.count_documents({
                "userId": user_id,
                "completed": True
            })
            active_goals = await goals_collection.count_documents({
                "userId": user_id,
                "status": "active",
                "completed": False
            })
            total_achievements = await achievements_collection.count_documents({"userId": user_id})
            
            return {
                "success": True,
                "data": {
                    "id": user_id,
                    "name": user.get("name"),
                    "email": user.get("email"),
                    "username": user.get("username"),
                    "level": user.get("level", 1),
                    "rank": user.get("rank", "E"),
                    "title": user.get("title", "Awakened Hunter"),
                    "totalPoints": user.get("totalPoints", 0),
                    "loginPlatform": user.get("loginPlatform"),
                    "joinedAt": user.get("joinedAt"),
                    "lastActive": user.get("lastActive"),
                    "preferences": user.get("preferences", {}),
                    "stats": {
                        "totalGoals": total_goals,
                        "completedGoals": completed_goals,
                        "activeGoals": active_goals,
                        "totalAchievements": total_achievements
                    }
                }
            }
        
        except Exception as e:
            logger.error(f"❌ Error getting user profile: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def get_dashboard_metrics(user_email: str) -> Dict:
        """
        Get comprehensive dashboard metrics for a user.
        
        Returns:
            {
                "overview": {...},
                "categories": [...],
                "trends": {...}
            }
        """
        try:
            user = await users_collection.find_one({"email": user_email})
            if not user:
                return {"success": False, "error": "User not found"}
            
            user_id = str(user["_id"])
            
            # Get all goals
            all_goals = await goals_collection.find({"userId": user_id}).to_list(length=1000)
            
            # Calculate metrics
            total_goals = len(all_goals)
            completed_goals = len([g for g in all_goals if g.get("completed")])
            active_goals = len([g for g in all_goals if g.get("status") == "active"])
            completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
            
            # Category breakdown
            categories = ["productivity", "learning", "career", "fitness", "personal", "health", "finance"]
            category_metrics = []
            
            for category in categories:
                cat_goals = [g for g in all_goals if g.get("category") == category]
                if cat_goals:
                    cat_total = len(cat_goals)
                    cat_completed = len([g for g in cat_goals if g.get("completed")])
                    cat_rate = (cat_completed / cat_total * 100) if cat_total > 0 else 0
                    
                    category_metrics.append({
                        "category": category,
                        "total": cat_total,
                        "completed": cat_completed,
                        "completionRate": round(cat_rate, 1)
                    })
            
            return {
                "success": True,
                "data": {
                    "overview": {
                        "totalGoals": total_goals,
                        "completedGoals": completed_goals,
                        "activeGoals": active_goals,
                        "completionRate": round(completion_rate, 1),
                        "totalPoints": user.get("totalPoints", 0),
                        "level": user.get("level", 1),
                        "rank": user.get("rank", "E")
                    },
                    "categories": category_metrics
                }
            }
        
        except Exception as e:
            logger.error(f"❌ Error getting dashboard metrics: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def update_user_preferences(
        user_email: str,
        preferences: Dict[str, Any]
    ) -> Dict:
        """Update user preferences (theme, notifications, language, etc)."""
        try:
            result = await users_collection.update_one(
                {"email": user_email},
                {"$set": {"preferences": preferences, "updatedAt": datetime.utcnow()}}
            )
            
            if result.matched_count == 0:
                return {"success": False, "error": "User not found"}
            
            return {"success": True, "message": "Preferences updated"}
        
        except Exception as e:
            logger.error(f"❌ Error updating preferences: {e}")
            return {"success": False, "error": str(e)}
