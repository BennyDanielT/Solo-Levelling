"""
LangChain Tool definitions for AI Agent
Direct integration with service functions - NO WRAPPERS
"""
from langchain_core.tools import tool
from typing import Optional, List
from goal_service import GoalService
from stocks import StockService
from news import NewsService
from loguru import logger


# ==================== GOAL TOOLS ====================

@tool
async def get_user_goals(user_email: str) -> str:
    """
    Get all goals for a user.
    Use this when the user asks about their goals, progress, or wants to review what they're working on.
    
    Args:
        user_email: User's email address
    
    Returns:
        JSON string containing user's goals
    """
    try:
        logger.info(f"🎯 [TOOL] get_user_goals({user_email})")
        result = await GoalService.get_user_goals(user_email)
        logger.info(f"✅ Got {len(result.get('data', []))} goals")
        import json
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


@tool
async def create_goal(
    user_email: str,
    title: str,
    description: str = "",
    category: str = "personal",
    priority: str = "medium",
    target_date: Optional[str] = None
) -> str:
    """
    Create a new goal for a user.
    Use this when the user wants to set a new goal or create a task.
    
    Args:
        user_email: User's email address (required)
        title: Goal title (required)
        description: Goal description
        category: Goal category - fitness, learning, career, personal, finance, health
        priority: Goal priority - low, medium, high
        target_date: Target completion date in ISO format YYYY-MM-DD
    
    Returns:
        JSON string with created goal details
    """
    try:
        logger.info(f"🎯 [TOOL] create_goal({title}) for {user_email}")
        result = await GoalService.create_goal(
            user_email=user_email,
            title=title,
            description=description,
            category=category,
            priority=priority,
            target_date=target_date
        )
        logger.info("✅ Goal created")
        import json
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


@tool
async def delete_goal(user_email: str, goal_id: str) -> str:
    """
    Delete a goal for a user.
    Use this when the user wants to remove or delete a goal.
    
    Args:
        user_email: User's email address (required)
        goal_id: ID of the goal to delete (required)
    
    Returns:
        JSON string with deletion result
    """
    try:
        logger.info(f"🎯 [TOOL] delete_goal({goal_id}) for {user_email}")
        result = await GoalService.delete_goal(user_email, goal_id)
        logger.info("✅ Goal deleted")
        import json
        return json.dumps(result)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


@tool
async def update_goal(
    user_email: str,
    goal_id: str,
    progress: Optional[int] = None,
    status: Optional[str] = None
) -> str:
    """
    Update a goal's progress or status.
    Use this when the user wants to update progress on a goal.
    
    Args:
        user_email: User's email address (required)
        goal_id: ID of the goal to update (required)
        progress: Progress percentage (0-100)
        status: Goal status (active, paused, completed)
    
    Returns:
        JSON string with updated goal
    """
    try:
        logger.info(f"🎯 [TOOL] update_goal({goal_id}) for {user_email}")
        result = await GoalService.update_goal(user_email, goal_id, progress, status)
        logger.info("✅ Goal updated")
        import json
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


# ==================== STOCK TOOLS ====================

@tool
async def get_stock_history(symbol: str, period: str = "1mo") -> str:
    """
    Get historical stock price data for a specific symbol.
    Use this when the user asks about stock price trends, historical data, or chart information.
    
    Args:
        symbol: Stock symbol (e.g., 'AAPL', 'TSLA', 'GOOGL')
        period: Time period for historical data - 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    
    Returns:
        JSON string containing historical stock data
    """
    try:
        logger.info(f"📊 [TOOL] get_stock_history({symbol}, {period})")
        result = await StockService.get_stock_history(symbol.upper(), period)
        if not result:
            import json
            return json.dumps({"success": False, "error": f"No data found for {symbol}"})
        logger.info(f"✅ Got {len(result.get('history', []))} data points")
        import json
        return json.dumps({"success": True, "data": result})
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


@tool
async def get_stock_quote(symbol: str) -> str:
    """
    Get current stock quote and price information.
    Use this when the user asks about current stock prices.
    
    Args:
        symbol: Stock symbol (e.g., 'AAPL', 'TSLA')
    
    Returns:
        JSON string with current quote
    """
    try:
        logger.info(f"📊 [TOOL] get_stock_quote({symbol})")
        quote = await StockService.get_stock_quote(symbol.upper())
        if not quote:
            import json
            return json.dumps({"success": False, "error": f"Stock not found: {symbol}"})
        logger.info("✅ Got quote")
        import json
        return json.dumps({"success": True, "data": quote})
    except Exception as e:
        logger.error(f"💥 Error: {str(e)}")
        import json
        return json.dumps({"success": False, "error": str(e)})


# ==================== NEWS TOOLS ====================

@tool
async def get_news_by_category(category: str, limit: int = 10) -> str:
    """
    Get news articles by category.
    Use this when the user asks for news in a specific category like technology, business, sports, health, etc.
    
    Args:
        category: News category (business, technology, health, sports, entertainment, science)
        limit: Maximum number of articles to return (default: 10)
    
    Returns:
        JSON string with news articles
    """
    try:
        logger.info(f"📰 [TOOL] get_news_by_category({category}, limit={limit})")
        articles = await NewsService.get_news_by_category(category, limit)
        logger.info(f"✅ Got {len(articles)} articles")
        import json
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
        import json
        return json.dumps({"success": False, "error": str(e)})


def get_all_tools():
    """Get all tools for LangChain agent"""
    return [
        get_user_goals,
        create_goal,
        delete_goal,
        update_goal,
        get_stock_history,
        get_stock_quote,
        get_news_by_category,
    ]
