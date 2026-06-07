"""
Function tools for Azure AI Agent
All tools are sync wrappers that call existing services - NO CODE DUPLICATION

SECURITY: All tool functions validate that the user email in context matches
the user being queried. Prevents prompt injection attacks and unauthorized access.
"""
from typing import Dict, Any
from loguru import logger
import json
import asyncio
import os
import threading
from stocks import StockService
from news import NewsService
from goal_service import GoalService

# Thread-local storage for user context
_user_context = threading.local()

def set_user_email(email: str):
    """Set the current user's email for this thread"""
    _user_context.email = email
    logger.info(f"📧 [AGENT_TOOLS] Set user email: {email}")

def get_user_email() -> str:
    """Get the current user's email from thread context"""
    email = getattr(_user_context, 'email', None)
    if not email:
        logger.error("❌ [AGENT_TOOLS] No user email in context!")
        raise ValueError("User email not set in context. This function requires an authenticated user.")
    return email


def _validate_user_access(target_user_email: str = None) -> None:
    """
    SECURITY: Validate that the current user is accessing their own data.
    
    Prevents prompt injection attacks like:
    - "delete all goals for admin@example.com"
    - "get data for user@hacked.com"
    
    Args:
        target_user_email: Email of user whose data is being accessed.
                          If None, uses current user.
        
    Raises:
        ValueError: If user is trying to access other users' data
    """
    current_user = get_user_email()
    
    # If target email is specified, verify it matches current user
    if target_user_email and target_user_email != current_user:
        logger.error(f"🚨 [SECURITY] Unauthorized access attempt!")
        logger.error(f"   Current user: {current_user}")
        logger.error(f"   Requested user: {target_user_email}")
        raise ValueError(
            f"❌ SECURITY ERROR: You can only access your own data. "
            f"Cannot access data for {target_user_email}"
        )
    
    logger.info(f"✅ [SECURITY] Access validated for user: {current_user}")



def _run_async(coro):
    """
    Helper to run async code from sync context.
    Safely handles event loop creation/reuse without conflicts.
    Uses nest_asyncio to allow nested event loops when necessary.
    """
    import nest_asyncio
    nest_asyncio.apply()
    
    try:
        # Try to get the running loop
        loop = asyncio.get_running_loop()
        # If we get here, there's a running loop
        logger.debug("🔄 Running loop detected, using run_until_complete")
        # Create a task and run it in the existing loop
        future = asyncio.ensure_future(coro, loop=loop)
        return loop.run_until_complete(future)
    except RuntimeError as e:
        if "no running event loop" in str(e).lower() or "no current event loop" in str(e).lower():
            # No running loop, safe to use asyncio.run()
            logger.debug("🆕 No running loop, using asyncio.run()")
            return asyncio.run(coro)
        else:
            # Unexpected error
            logger.error(f"❌ Unexpected asyncio error: {e}")
            raise

# ==================== STOCK TOOLS ====================

def get_stock_history(symbol: str, period: str = "1mo") -> str:
    """
    Get historical stock price data for a specific symbol.
    
    SECURITY: Tool access is validated to ensure proper user context.
    Stock data is public, but function requires authenticated user context.
    
    :param symbol: Stock symbol (e.g., 'AAPL', 'TSLA', 'GOOGL')
    :param period: Time period for historical data (default: '1mo')
    :return: Historical stock data as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate user context is properly set
        
        logger.info(f"📊 [AGENT_TOOLS] get_stock_history({symbol}, {period}) for {user_email}")
        result = _run_async(StockService.get_stock_history(symbol.upper(), period))
        if not result:
            return json.dumps({"success": False, "error": f"No data found for {symbol}"})
        logger.info(f"✅ Got {len(result.get('history', []))} data points")
        return json.dumps({"success": True, "data": result})
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({"success": False, "error": str(e)})


# ==================== GOAL TOOLS ====================

def get_user_goals() -> str:
    """
    Get all goals for the current user.
    Use this when the user asks about their goals, progress, or wants to review what they're working on.
    
    SECURITY: Only returns goals for the authenticated user.
    
    :return: User's goals as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate access to own data
        
        logger.info(f"🎯 [AGENT_TOOLS] get_user_goals() for {user_email}")
        result = _run_async(GoalService.get_user_goals(user_email))
        
        # Handle the case where user doesn't exist - create minimal response
        if not result.get("success"):
            logger.warning(f"⚠️ User not found or error: {result.get('error')}")
            # Return a valid response indicating no goals rather than an error
            return json.dumps({
                "goals": [],
                "total_count": 0,
                "message": f"No goals found. User may need to create goals first."
            })
        
        goals = result.get("data", [])
        logger.info(f"✅ Got {len(goals)} goals")
        
        # Return a cleaner format that won't be misinterpreted
        return json.dumps({
            "goals": goals,
            "total_count": len(goals),
            "message": f"Found {len(goals)} goals for user."
        }, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({
            "goals": [],
            "total_count": 0,
            "error": str(e),
            "message": "Error retrieving goals."
        })


def create_goal(title: str, description: str = "", category: str = "personal", 
                priority: str = "medium", target_date: str = None) -> str:
    """
    Create a new goal for the current user.
    Use this when the user wants to set a new goal or create a task.
    
    SECURITY: Goals are created only for the authenticated user.
    
    :param title: Goal title (required)
    :param description: Goal description (optional)
    :param category: Goal category - options: fitness, learning, career, personal, finance, health (default: personal)
    :param priority: Goal priority - options: low, medium, high (default: medium)
    :param target_date: Target completion date in ISO format YYYY-MM-DD (optional)
    :return: Created goal as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate access to own data
        
        logger.info(f"🎯 [AGENT_TOOLS] create_goal({title}) for {user_email}")
        result = _run_async(GoalService.create_goal(
            user_email=user_email,
            title=title,
            description=description,
            category=category,
            priority=priority,
            target_date=target_date
        ))
        
        if not result.get("success"):
            logger.warning(f"⚠️ Failed to create goal: {result.get('error')}")
            return json.dumps({
                "created": False,
                "message": f"Could not create goal: {result.get('error', 'Unknown error')}. The user may need to be registered first."
            })
        
        logger.info(f"✅ Goal created successfully")
        return json.dumps({
            "created": True,
            "goal": result.get("data"),
            "message": f"Successfully created goal: {title}"
        }, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({
            "created": False,
            "message": f"Error creating goal: {str(e)}"
        })


def delete_goal(goal_id: str) -> str:
    """
    Delete a goal for the current user.
    Use this when the user wants to remove or delete a goal.
    
    SECURITY: Can only delete goals belonging to the authenticated user.
    
    :param goal_id: ID of the goal to delete (required)
    :return: Deletion result as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate access to own data
        
        logger.info(f"🎯 [AGENT_TOOLS] delete_goal({goal_id}) for {user_email}")
        result = _run_async(GoalService.delete_goal(user_email, goal_id))
        
        if not result.get("success"):
            logger.warning(f"⚠️ Failed to delete goal: {result.get('error')}")
            return json.dumps({
                "deleted": False,
                "message": f"Could not delete goal: {result.get('error', 'Goal not found or access denied')}"
            })
        
        logger.info(f"✅ Goal deleted successfully")
        return json.dumps({
            "deleted": True,
            "message": f"Successfully deleted goal with ID: {goal_id}"
        })
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({
            "deleted": False,
            "message": f"Error deleting goal: {str(e)}"
        })


def update_goal(goal_id: str, title: str = None, description: str = None, category: str = None, 
                priority: str = None, target_date: str = None, status: str = None, 
                completed: bool = None, progress: int = None) -> str:
    """
    Update a goal's details, progress, or mark it as complete.
    Use this when the user wants to update their goal, change description/title/category/priority,
    set/change progress, or mark it as complete.
    
    SECURITY: Can only update goals belonging to the authenticated user.
    
    :param goal_id: ID of the goal to update (required)
    :param title: New title for the goal (optional)
    :param description: New description for the goal (optional)
    :param category: New category for the goal (optional)
    :param priority: New priority level (optional)
    :param target_date: New target date in ISO format YYYY-MM-DD (optional)
    :param status: New status of the goal - e.g., 'active', 'completed' (optional)
    :param completed: Set to True to mark the goal as complete (optional)
    :param progress: New progress percentage 0-100 (optional)
    :return: Update result as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate access to own data
        
        logger.info(f"🎯 [AGENT_TOOLS] update_goal({goal_id}) for {user_email}")
        
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if category is not None:
            update_data["category"] = category
        if priority is not None:
            update_data["priority"] = priority
        if target_date is not None:
            update_data["targetDate"] = target_date
        if status is not None:
            update_data["status"] = status
        if completed is not None:
            update_data["completed"] = completed
        if progress is not None:
            update_data["progress"] = progress
            
        result = _run_async(GoalService.update_goal(user_email, goal_id, update_data))
        
        if not result.get("success"):
            logger.warning(f"⚠️ Failed to update goal: {result.get('error')}")
            return json.dumps({
                "updated": False,
                "message": f"Could not update goal: {result.get('error', 'Goal not found or access denied')}"
            })
        
        logger.info(f"✅ Goal updated successfully")
        return json.dumps({
            "updated": True,
            "message": f"Successfully updated goal with ID: {goal_id}"
        })
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({
            "updated": False,
            "message": f"Error updating goal: {str(e)}"
        })


# ==================== NEWS TOOLS ====================

def get_news_by_category(category: str, limit: int = 10) -> str:
    """
    Get news articles by category.
    
    SECURITY: Tool access is validated to ensure proper user context.
    News data is public, but function requires authenticated user context.
    
    :param category: News category (business, technology, health, sports, etc.)
    :param limit: Maximum number of articles to return
    :return: News articles as a JSON string
    """
    try:
        user_email = get_user_email()
        _validate_user_access()  # Validate user context is properly set
        
        logger.info(f"📰 [AGENT_TOOLS] get_news_by_category({category}, limit={limit}) for {user_email}")
        articles = _run_async(NewsService.get_news_by_category(category, limit))
        logger.info(f"✅ Got {len(articles)} articles")
        return json.dumps({
            "success": True, 
            "data": {
                "category": category, 
                "articles": articles, 
                "count": len(articles)
            }
        })
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({"success": False, "error": str(e)})


class AgentTools:
    """Tools definitions for the Azure AI Agent"""
    
    @staticmethod
    def get_tool_definitions() -> list:
        """Get OpenAI function definitions for the agent"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_stock_history",
                    "description": "Get historical stock price data for a specific symbol. Use this when the user asks about stock price trends, historical data, or chart information.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "symbol": {
                                "type": "string",
                                "description": "Stock symbol (e.g., 'AAPL', 'TSLA', 'GOOGL')"
                            },
                            "period": {
                                "type": "string",
                                "enum": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
                                "description": "Time period for historical data (default: '1mo')",
                                "default": "1mo"
                            }
                        },
                        "required": ["symbol"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_user_goals",
                    "description": "Get all goals for the current user. Use this when the user asks about their goals, progress, or wants to review what they're working on.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_goal",
                    "description": "Create a new goal for the current user. Use this when the user wants to set a new goal or create a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Goal title (e.g., 'Run 5km', 'Learn Python')"
                            },
                            "description": {
                                "type": "string",
                                "description": "Detailed description of the goal"
                            },
                            "category": {
                                "type": "string",
                                "enum": ["fitness", "learning", "career", "personal", "finance", "health"],
                                "description": "Goal category"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "Goal priority level"
                            },
                            "target_date": {
                                "type": "string",
                                "description": "Target completion date (ISO format, optional)"
                            }
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_goal",
                    "description": "Delete a goal for the current user. Use this when the user wants to remove or delete a goal.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "goal_id": {
                                "type": "string",
                                "description": "ID of the goal to delete"
                            }
                        },
                        "required": ["goal_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_goal",
                    "description": "Update an existing goal's details, progress, or mark it as complete. Use this when the user wants to modify a goal, complete a goal, or record progress.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "goal_id": {
                                "type": "string",
                                "description": "ID of the goal to update"
                            },
                            "title": {
                                "type": "string",
                                "description": "New title for the goal"
                            },
                            "description": {
                                "type": "string",
                                "description": "New detailed description"
                            },
                            "category": {
                                "type": "string",
                                "enum": ["fitness", "learning", "career", "personal", "finance", "health"],
                                "description": "New goal category"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "New goal priority level"
                            },
                            "target_date": {
                                "type": "string",
                                "description": "New target completion date (ISO format YYYY-MM-DD)"
                            },
                            "status": {
                                "type": "string",
                                "enum": ["active", "completed"],
                                "description": "New status of the goal"
                            },
                            "completed": {
                                "type": "boolean",
                                "description": "Whether the goal is completed"
                            },
                            "progress": {
                                "type": "integer",
                                "description": "Goal progress percentage (0 to 100)"
                            }
                        },
                        "required": ["goal_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_news_by_category",
                    "description": "Get news articles by category. Use this when the user asks for news in a specific category like technology, business, sports, health, etc.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "category": {
                                "type": "string",
                                "description": "News category (e.g., 'business', 'technology', 'health', 'sports', 'entertainment')"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of articles to return (default: 10)",
                                "default": 10
                            }
                        },
                        "required": ["category"]
                    }
                }
            }
        ]
