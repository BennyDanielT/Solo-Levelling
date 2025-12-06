"""
Stock market data service using yfinance
"""
import yfinance as yf
from typing import List, Dict, Optional
from loguru import logger
from datetime import datetime

class StockService:
    """Service for fetching stock market data"""
    
    @staticmethod
    async def search_stocks(query: str) -> List[Dict]:
        """Search for stocks by symbol or company name"""
        try:
            query_upper = query.upper()
            results = []
            
            # Common stock symbols and companies for quick search
            common_stocks = {
                # Tech
                "AAPL": "Apple Inc.", "MSFT": "Microsoft Corporation", "GOOGL": "Alphabet Inc.", 
                "AMZN": "Amazon.com Inc.", "META": "Meta Platforms Inc.", "TSLA": "Tesla Inc.",
                "NVDA": "NVIDIA Corporation", "NFLX": "Netflix Inc.", "AMD": "Advanced Micro Devices",
                "INTC": "Intel Corporation", "ORCL": "Oracle Corporation", "CRM": "Salesforce Inc.",
                # Finance
                "JPM": "JPMorgan Chase & Co.", "BAC": "Bank of America Corp", "WFC": "Wells Fargo & Company",
                "GS": "Goldman Sachs Group Inc.", "MS": "Morgan Stanley", "V": "Visa Inc.", "MA": "Mastercard Inc.",
                # Retail
                "WMT": "Walmart Inc.", "TGT": "Target Corporation", "COST": "Costco Wholesale",
                "HD": "Home Depot Inc.", "NKE": "Nike Inc.",
                # Healthcare
                "JNJ": "Johnson & Johnson", "PFE": "Pfizer Inc.", "UNH": "UnitedHealth Group",
                "CVS": "CVS Health Corporation", "ABBV": "AbbVie Inc.",
                # Energy
                "XOM": "Exxon Mobil Corporation", "CVX": "Chevron Corporation",
                # Other
                "DIS": "Walt Disney Company", "BA": "Boeing Company", "KO": "Coca-Cola Company",
                "PEP": "PepsiCo Inc.", "MCD": "McDonald's Corporation"
            }
            
            # Search in our common stocks dictionary first for speed
            for symbol, name in common_stocks.items():
                # Match by symbol or company name
                if query_upper in symbol or query_upper in name.upper():
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "exchange": "NASDAQ/NYSE",
                        "type": "EQUITY"
                    })
            
            # If we found matches in common stocks, return them
            if results:
                logger.info(f"Found {len(results)} stocks matching '{query}' in quick search")
                return results[:10]  # Limit to 10 results
            
            # Fallback: Try direct ticker lookup for exact matches
            try:
                ticker = yf.Ticker(query_upper)
                info = ticker.info
                
                if info and 'symbol' in info:
                    results.append({
                        "symbol": info.get('symbol', query_upper),
                        "name": info.get('longName', info.get('shortName', query_upper)),
                        "exchange": info.get('exchange', 'N/A'),
                        "type": info.get('quoteType', 'EQUITY')
                    })
            except Exception as e:
                logger.debug(f"Direct ticker lookup failed for {query}: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []
    
    @staticmethod
    async def get_stock_quote(symbol: str) -> Optional[Dict]:
        """Get current quote for a stock symbol"""
        try:
            ticker = yf.Ticker(symbol.upper())
            info = ticker.info
            
            # Get current price and daily change
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
            
            if not current_price:
                return None
            
            # Calculate change
            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            return {
                "symbol": symbol.upper(),
                "name": info.get('longName', info.get('shortName', symbol)),
                "price": round(current_price, 2),
                "change": round(change, 2),
                "changePercent": round(change_percent, 2),
                "high": info.get('dayHigh'),
                "low": info.get('dayLow'),
                "open": info.get('open'),
                "previousClose": previous_close,
                "volume": info.get('volume'),
                "marketCap": info.get('marketCap'),
                "currency": info.get('currency', 'USD'),
                "exchange": info.get('exchange'),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching stock quote for {symbol}: {e}")
            return None
    
    @staticmethod
    async def get_multiple_quotes(symbols: List[str]) -> List[Dict]:
        """Get quotes for multiple stock symbols"""
        quotes = []
        for symbol in symbols:
            quote = await StockService.get_stock_quote(symbol)
            if quote:
                quotes.append(quote)
        return quotes
    
    @staticmethod
    async def get_stock_history(symbol: str, period: str = "1mo") -> Optional[Dict]:
        """
        Get historical data for a stock
        period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        """
        try:
            ticker = yf.Ticker(symbol.upper())
            hist = ticker.history(period=period)
            
            if hist.empty:
                return None
            
            # Convert DataFrame to dict format
            history = []
            for index, row in hist.iterrows():
                history.append({
                    "date": index.strftime("%Y-%m-%d"),
                    "open": round(row['Open'], 2),
                    "high": round(row['High'], 2),
                    "low": round(row['Low'], 2),
                    "close": round(row['Close'], 2),
                    "volume": int(row['Volume'])
                })
            
            return {
                "symbol": symbol.upper(),
                "period": period,
                "history": history
            }
        except Exception as e:
            logger.error(f"Error fetching stock history for {symbol}: {e}")
            return None
