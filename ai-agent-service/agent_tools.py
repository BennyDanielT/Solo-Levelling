"""
Function tools for Azure AI Agent
All tools are sync wrappers that call existing services - NO CODE DUPLICATION
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


# ==================== STOCK TOOLS ====================

def get_stock_history(symbol: str, period: str = "1mo") -> str:
    """
    Get historical stock price data for a specific symbol.
    
    :param symbol: Stock symbol (e.g., 'AAPL', 'TSLA', 'GOOGL')
    :param period: Time period for historical data (default: '1mo')
    :return: Historical stock data as a JSON string
    """
    logger.info(f"📊 [AGENT_TOOLS] get_stock_history({symbol}, {period})")
    try:
        result = asyncio.run(StockService.get_stock_history(symbol.upper(), period))
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
    
    :return: User's goals as a JSON string
    """
    try:
        user_email = get_user_email()
        logger.info(f"🎯 [AGENT_TOOLS] get_user_goals() for {user_email}")
        result = asyncio.run(GoalService.get_user_goals(user_email))
        logger.info(f"✅ Got {len(result.get('data', []))} goals")
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({"success": False, "error": str(e)})


def create_goal(title: str, description: str = "", category: str = "personal", 
                priority: str = "medium", target_date: str = None) -> str:
    """
    Create a new goal for the current user.
    Use this when the user wants to set a new goal or create a task.
    
    :param title: Goal title (required)
    :param description: Goal description (optional)
    :param category: Goal category - options: fitness, learning, career, personal, finance, health (default: personal)
    :param priority: Goal priority - options: low, medium, high (default: medium)
    :param target_date: Target completion date in ISO format YYYY-MM-DD (optional)
    :return: Created goal as a JSON string
    """
    try:
        user_email = get_user_email()
        logger.info(f"🎯 [AGENT_TOOLS] create_goal({title}) for {user_email}")
        result = asyncio.run(GoalService.create_goal(
            user_email=user_email,
            title=title,
            description=description,
            category=category,
            priority=priority,
            target_date=target_date
        ))
        logger.info(f"✅ Goal created")
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({"success": False, "error": str(e)})


def delete_goal(goal_id: str) -> str:
    """
    Delete a goal for the current user.
    Use this when the user wants to remove or delete a goal.
    
    :param goal_id: ID of the goal to delete (required)
    :return: Deletion result as a JSON string
    """
    try:
        user_email = get_user_email()
        logger.info(f"🎯 [AGENT_TOOLS] delete_goal({goal_id}) for {user_email}")
        result = asyncio.run(GoalService.delete_goal(user_email, goal_id))
        logger.info(f"✅ Goal deleted")
        return json.dumps(result)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        return json.dumps({"success": False, "error": str(e)})


# ==================== NEWS TOOLS ====================

def get_news_by_category(category: str, limit: int = 10) -> str:
    """
    Get news articles by category.
    
    :param category: News category (business, technology, health, sports, etc.)
    :param limit: Maximum number of articles to return
    :return: News articles as a JSON string
    """
    logger.info(f"📰 [AGENT_TOOLS] get_news_by_category({category}, limit={limit})")
    try:
        articles = asyncio.run(NewsService.get_news_by_category(category, limit))
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
    """Tools for agent to call database functions with fresh connections"""
    
    def __init__(self):
        # Use same env vars as database.py
        self.mongo_uri = os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL")
        if not self.mongo_uri:
            raise ValueError("MONGODB_URL or DATABASE_URL environment variable is not set")
        self.db_name = "solo_levelling"
    
    def _get_db(self):
        """Create a fresh database connection for this event loop"""
        client = AsyncIOMotorClient(self.mongo_uri)
        return client[self.db_name]
    
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
