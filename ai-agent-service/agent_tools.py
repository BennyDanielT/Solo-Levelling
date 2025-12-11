"""
Function tools for Azure AI Agent
Creates fresh database connections per call to avoid event loop conflicts
"""
from typing import Dict, Any
from loguru import logger
import os
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from stocks import StockService


def get_stock_history(symbol: str, period: str = "1mo") -> str:
    """
    Get historical stock price data for a specific symbol.
    This is a sync wrapper that calls StockService.get_stock_history.
    
    :param symbol: Stock symbol (e.g., 'AAPL', 'TSLA', 'GOOGL')
    :param period: Time period for historical data (default: '1mo')
    :return: Historical stock data as a JSON string
    """
    logger.info(f"📊 [AGENT_TOOLS] Getting stock history for {symbol}, period: {period}")
    try:
        async def _get_history():
            result = await StockService.get_stock_history(symbol.upper(), period)
            
            if not result:
                logger.warning(f"⚠️ [AGENT_TOOLS] No data found for {symbol}")
                return {"success": False, "error": f"No data found for {symbol}"}
            
            logger.info(f"✅ [AGENT_TOOLS] Got {len(result.get('history', []))} data points for {symbol}")
            return {"success": True, "data": result}
        
        result = asyncio.run(_get_history())
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"💥 [AGENT_TOOLS] Error getting stock history: {type(e).__name__}: {str(e)}")
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
            }
        ]
