"""
News service using NewsAPI.org (free tier available)
Get your free API key at: https://newsapi.org/register
"""
import aiohttp
from typing import List, Dict, Optional
from loguru import logger
import os
from datetime import datetime

# For free tier, use this key or get your own at newsapi.org
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")  # Add to .env file

class NewsService:
    """Service for fetching news from NewsAPI.org"""
    
    # News categories supported by NewsAPI
    CATEGORIES = [
        "business",
        "technology",
        "entertainment",
        "sports",
        "health",
        "science",
        "general"
    ]
    
    @staticmethod
    async def get_news_by_category(category: str = "business", limit: int = 10) -> List[Dict]:
        """
        Fetch news articles by category from NewsAPI.org
        """
        try:
            logger.info(f"Fetching news for category: {category}")
            
            # Use NewsAPI.org free tier
            url = "https://newsapi.org/v2/top-headlines"
            params = {
                "category": category,
                "country": "us",  # Can be changed to other countries
                "pageSize": min(limit, 100),  # Free tier allows up to 100
                "apiKey": NEWS_API_KEY or "demo"  # Use demo key if no key provided
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = data.get("articles", [])
                        
                        # Transform to our format
                        transformed = []
                        for idx, article in enumerate(articles[:limit]):
                            transformed.append({
                                "id": f"{category}-{idx}-{article.get('publishedAt', '')}",
                                "title": article.get("title", "No title"),
                                "description": article.get("description", ""),
                                "url": article.get("url", "#"),
                                "imageUrl": article.get("urlToImage"),
                                "source": article.get("source", {}).get("name", "Unknown"),
                                "publishedAt": article.get("publishedAt", datetime.now().isoformat()),
                                "category": category,
                                "author": article.get("author")
                            })
                        
                        logger.info(f"Fetched {len(transformed)} articles for {category}")
                        return transformed
                    elif response.status == 426:
                        logger.warning("NewsAPI requires upgrade - using fallback data")
                        return await NewsService._get_fallback_news(category, limit)
                    else:
                        logger.error(f"NewsAPI error: {response.status}")
                        return await NewsService._get_fallback_news(category, limit)
                        
        except Exception as e:
            logger.error(f"Error fetching news for category {category}: {e}")
            return await NewsService._get_fallback_news(category, limit)
    
    @staticmethod
    async def _get_fallback_news(category: str, limit: int) -> List[Dict]:
        """Fallback to GNews.io free tier if NewsAPI fails"""
        try:
            url = "https://gnews.io/api/v4/top-headlines"
            params = {
                "category": category,
                "lang": "en",
                "max": min(limit, 10),  # Free tier limit
                "apikey": "demo"  # Uses demo mode
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = data.get("articles", [])
                        
                        transformed = []
                        for idx, article in enumerate(articles):
                            transformed.append({
                                "id": f"{category}-{idx}",
                                "title": article.get("title", "No title"),
                                "description": article.get("description", ""),
                                "url": article.get("url", "#"),
                                "imageUrl": article.get("image"),
                                "source": article.get("source", {}).get("name", "GNews"),
                                "publishedAt": article.get("publishedAt", datetime.now().isoformat()),
                                "category": category
                            })
                        
                        return transformed
        except Exception as e:
            logger.error(f"Fallback news also failed: {e}")
        
        # Final fallback - generate realistic looking sample data
        return NewsService._get_sample_news(category, limit)
    
    @staticmethod
    def _get_sample_news(category: str, limit: int) -> List[Dict]:
        """Generate sample news when all APIs fail"""
        templates = {
            "business": [
                "Global Markets Rally on Economic Data",
                "Tech Stocks Lead Market Gains",
                "Federal Reserve Signals Policy Shift",
                "Corporate Earnings Beat Expectations",
                "Merger Activity Picks Up in Q4"
            ],
            "technology": [
                "AI Breakthrough Announced by Research Team",
                "New Smartphone Features Revealed",
                "Cybersecurity Threats on the Rise",
                "Cloud Computing Adoption Accelerates",
                "Tech Giants Face Regulatory Scrutiny"
            ],
            "sports": [
                "Championship Game Delivers Thrilling Finish",
                "Star Athlete Sets New Record",
                "Team Makes Surprising Trade Move",
                "Coach Announces Retirement Plans",
                "Olympic Preparations Underway"
            ],
            "health": [
                "Medical Breakthrough Offers New Hope",
                "Study Reveals Health Benefits",
                "Vaccine Development Progresses",
                "Healthcare Costs Continue to Rise",
                "Mental Health Awareness Campaign Launches"
            ],
            "science": [
                "Space Mission Discovers New Findings",
                "Climate Study Shows Concerning Trends",
                "Quantum Computing Milestone Reached",
                "Rare Species Discovered in Remote Location",
                "Research Sheds Light on Ancient Mystery"
            ]
        }
        
        titles = templates.get(category, templates["business"])
        articles = []
        
        for i in range(min(limit, len(titles))):
            articles.append({
                "id": f"{category}-sample-{i}",
                "title": titles[i],
                "description": f"Latest developments in {category}. This is sample data - configure NEWS_API_KEY in .env for real news.",
                "url": "https://newsapi.org/register",
                "imageUrl": None,
                "source": "Sample News",
                "publishedAt": datetime.now().isoformat(),
                "category": category
            })
        
        return articles
    
    @staticmethod
    async def get_news_by_query(query: str, limit: int = 10) -> List[Dict]:
        """Search news by keyword"""
        try:
            logger.info(f"Searching news for query: {query}")
            
            # Mock data - replace with actual API
            mock_articles = [
                {
                    "id": f"search-{query}-{i}",
                    "title": f"{query.title()} Related Article {i}",
                    "description": f"Article about {query}",
                    "url": f"https://example.com/search/{query}/{i}",
                    "imageUrl": None,
                    "source": "Sample News",
                    "publishedAt": datetime.now().isoformat(),
                    "category": "general"
                }
                for i in range(1, limit + 1)
            ]
            
            return mock_articles[:limit]
            
        except Exception as e:
            logger.error(f"Error searching news for query {query}: {e}")
            return []
    
    @staticmethod
    async def get_trending_news(limit: int = 10) -> List[Dict]:
        """Get trending/top news"""
        try:
            logger.info("Fetching trending news")
            
            # Mock data - replace with actual API
            mock_articles = [
                {
                    "id": f"trending-{i}",
                    "title": f"Trending News Article {i}",
                    "description": f"This is a trending news article {i}",
                    "url": f"https://example.com/trending/{i}",
                    "imageUrl": None,
                    "source": "Sample News",
                    "publishedAt": datetime.now().isoformat(),
                    "category": "general"
                }
                for i in range(1, limit + 1)
            ]
            
            return mock_articles[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching trending news: {e}")
            return []
    
    @staticmethod
    def get_available_categories() -> List[str]:
        """Get list of available news categories"""
        return NewsService.CATEGORIES


# Alternative: Using NewsAPI.org (requires free API key from newsapi.org)
class NewsAPIService:
    """Alternative news service using NewsAPI.org"""
    
    BASE_URL = "https://newsapi.org/v2"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def get_top_headlines(self, category: str = "business", country: str = "us", limit: int = 10) -> List[Dict]:
        """Fetch top headlines by category"""
        try:
            url = f"{self.BASE_URL}/top-headlines"
            params = {
                "apiKey": self.api_key,
                "category": category,
                "country": country,
                "pageSize": limit
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = data.get("articles", [])
                        
                        return [
                            {
                                "id": f"{article.get('source', {}).get('id', 'unknown')}-{i}",
                                "title": article.get("title"),
                                "description": article.get("description"),
                                "url": article.get("url"),
                                "imageUrl": article.get("urlToImage"),
                                "source": article.get("source", {}).get("name"),
                                "publishedAt": article.get("publishedAt"),
                                "category": category,
                                "author": article.get("author")
                            }
                            for i, article in enumerate(articles)
                        ]
                    else:
                        logger.error(f"NewsAPI error: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error fetching from NewsAPI: {e}")
            return []
    
    async def search_news(self, query: str, limit: int = 10) -> List[Dict]:
        """Search news articles"""
        try:
            url = f"{self.BASE_URL}/everything"
            params = {
                "apiKey": self.api_key,
                "q": query,
                "pageSize": limit,
                "sortBy": "publishedAt"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = data.get("articles", [])
                        
                        return [
                            {
                                "id": f"{article.get('source', {}).get('id', 'unknown')}-{i}",
                                "title": article.get("title"),
                                "description": article.get("description"),
                                "url": article.get("url"),
                                "imageUrl": article.get("urlToImage"),
                                "source": article.get("source", {}).get("name"),
                                "publishedAt": article.get("publishedAt"),
                                "category": "search",
                                "author": article.get("author")
                            }
                            for i, article in enumerate(articles)
                        ]
                    else:
                        logger.error(f"NewsAPI error: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error searching NewsAPI: {e}")
            return []
