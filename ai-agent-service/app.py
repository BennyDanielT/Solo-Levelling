from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from azure.ai.agents import AgentsClient
from azure.identity import DefaultAzureCredential
from datetime import datetime, timedelta
from bson import ObjectId
import os
import sys
from dotenv import load_dotenv
import time
import json
import asyncio
from loguru import logger

from database import (
    db, users_collection, goals_collection, achievements_collection, chat_threads_collection, ping_db
)
from models import (
    UserRegister, UserResponse, UserInDB,
    GoalCreate, GoalResponse, GoalInDB,
    AchievementResponse,
    ChatRequest, ChatResponse,
    StockSymbol, StockQuote, UserStockPreferences,
    NewsArticle, UserNewsPreferences
)
from auth import hash_password, verify_password, create_access_token, get_current_user
from stocks import StockService
from news import NewsService
from llm_service import llm_service
from goal_service import GoalService

# Import API routers for clean architecture
from api import chat_router, goals_router, user_router

load_dotenv()

# Configure loguru & observability
from observability import setup_observability, ObservabilityMiddleware
setup_observability()

app = FastAPI(title="Solo Levelling API")

# CORS middleware
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dash.maxeffortgazette.com",
    "https://cloud.maxeffortgazette.com",
]
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    extra_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    allowed_origins.extend(extra_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex="https://.*\\.azurecontainerapps\\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ObservabilityMiddleware)

# Include routers for clean architecture
app.include_router(chat_router)
app.include_router(goals_router)
app.include_router(user_router)

# Azure AI Configuration
PROJECT_ENDPOINT = os.getenv("AZURE_AI_PROJECT_ENDPOINT", "")
AGENT_ID = os.getenv("AZURE_EXISTING_AGENT_ID", "")

@app.on_event("startup")
async def startup_db_client():
    await ping_db()

@app.get("/health")
async def health():
    return {"status": "ok", "service": "Solo Levelling API"}

# ==================== AUTH ROUTES ====================

@app.post("/auth/register", response_model=dict, status_code=201)
async def register(data: dict):
    """Register a new user"""
    logger.info(f"🔵 [REGISTER] Registration request received for email: {data.get('email')}")
    
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    username = data.get("username")
    email_verified = data.get("emailVerified", False)
    verification_token = data.get("verificationToken")
    verification_expiry = data.get("verificationExpiry")
    
    logger.info(f"🔵 [REGISTER] Email verified status: {email_verified}")
    logger.info(f"🔵 [REGISTER] Has verification token: {bool(verification_token)}")
    
    if not email or not password:
        logger.error("❌ [REGISTER] Missing email or password")
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if user exists
    logger.info(f"🔍 [REGISTER] Checking if user exists: {email}")
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        logger.warning(f"⚠️  [REGISTER] User already exists: {email}")
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    if username:
        logger.info(f"🔍 [REGISTER] Checking if username exists: {username}")
        existing_username = await users_collection.find_one({"username": username})
        if existing_username:
            logger.warning(f"⚠️  [REGISTER] Username already taken: {username}")
            raise HTTPException(
                status_code=400,
                detail="Username is already taken"
            )
    
    # Hash password
    logger.info("🔐 [REGISTER] Hashing password")
    hashed_password = hash_password(password)
    
    # Create user document
    logger.info("📝 [REGISTER] Creating user document")
    user_doc = {
        "name": name or email.split("@")[0],
        "email": email,
        "username": username or email.split("@")[0],
        "password": hashed_password,
        "image": None,
        "level": 1,
        "totalPoints": 0,
        "rank": "E",
        "title": "Awakened Hunter",
        "loginPlatform": "email",
        "platformId": None,
        "emailVerified": email_verified,
        "verificationToken": verification_token,
        "verificationExpiry": verification_expiry,
        "joinedAt": datetime.utcnow(),
        "lastActive": datetime.utcnow(),
        "preferences": {
            "theme": "dark",
            "notifications": True,
            "language": "en"
        }
    }
    
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    logger.info(f"✅ [REGISTER] User created successfully with ID: {result.inserted_id}")
    
    # Create access token
    logger.info("🔑 [REGISTER] Creating access token")
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(days=7)
    )
    
    logger.info(f"🎉 [REGISTER] Registration complete for: {email}")
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "user": {
                "id": str(result.inserted_id),
                "name": name or email.split("@")[0],
                "email": email,
                "username": username or email.split("@")[0],
                "level": 1,
                "totalPoints": 0,
                "rank": "E",
                "title": "Awakened Hunter",
                "emailVerified": email_verified
            },
            "token": access_token
        }
    }

@app.post("/auth/login")
async def login(credentials: dict):
    """Login user"""
    logger.info(f"🔵 [LOGIN] Login attempt for: {credentials.get('email')}")
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        logger.error("❌ [LOGIN] Missing email or password")
        raise HTTPException(
            status_code=422,
            detail="Email and password are required"
        )
    
    user = await users_collection.find_one({"email": email})
    if not user:
        logger.warning(f"⚠️  [LOGIN] User not found: {email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if email is verified (only for email/password users)
    if user.get("loginPlatform") == "email" and not user.get("emailVerified", False):
        logger.warning(f"⚠️  [LOGIN] Email not verified: {email}")
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before signing in. Check your inbox for the verification link."
        )
    
    if not verify_password(password, user["password"]):
        logger.warning(f"⚠️  [LOGIN] Invalid password for: {email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Update last active
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastActive": datetime.utcnow()}}
    )
    
    logger.info(f"✅ [LOGIN] Login successful: {email}")
    # Create access token
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "username": user.get("username"),
            "level": user.get("level", 1),
            "rank": user.get("rank", "E")
        }
    }

@app.post("/auth/oauth-login")
async def oauth_login(data: dict):
    """Handle OAuth login (Google, etc.) and create/update user"""
    logger.info("🔐 [OAUTH] OAuth login request received")
    email = data.get("email")
    name = data.get("name")
    image = data.get("image")
    provider = data.get("provider", "google")
    provider_id = data.get("providerId")
    
    if not email:
        raise HTTPException(status_code=422, detail="Email is required")
    
    # Check if user exists
    user = await users_collection.find_one({"email": email})
    
    if user:
        # Update last active and image if changed
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "lastActive": datetime.utcnow(),
                "image": image,
                "loginPlatform": provider,
                "platformId": provider_id
            }}
        )
        
        # Generate JWT token for existing user
        access_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(days=7)
        )
        
        logger.info(f"✅ [OAUTH] Existing user logged in: {email}")
        return {
            "success": True,
            "message": "User updated",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name"),
                "username": user.get("username"),
                "level": user.get("level", 1),
                "rank": user.get("rank", "E")
            }
        }
    
    # Create new user
    user_doc = {
        "name": name,
        "email": email,
        "username": None,
        "password": None,  # OAuth users don't have password
        "image": image,
        "level": 1,
        "totalPoints": 0,
        "rank": "E",
        "title": "Awakened Hunter",
        "loginPlatform": provider,
        "platformId": provider_id,
        "emailVerified": True,  # OAuth emails are pre-verified
        "verificationToken": None,
        "verificationExpiry": None,
        "joinedAt": datetime.utcnow(),
        "lastActive": datetime.utcnow(),
        "preferences": {
            "theme": "dark",
            "notifications": True,
            "language": "en"
        }
    }
    
    result = await users_collection.insert_one(user_doc)
    
    # Generate JWT token for new user
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(days=7)
    )
    
    logger.info(f"✅ [OAUTH] New user created: {email}")
    return {
        "success": True,
        "message": "User created",
        "access_token": access_token,
        "token_type": "bearer",
        "data": {
            "id": str(result.inserted_id),
            "email": email,
            "name": name,
            "level": 1,
            "rank": "E"
        }
    }

@app.post("/auth/verify-email")
async def verify_email(data: dict):
    """Verify user email with token"""
    logger.info("📧 [VERIFY] Email verification request received")
    token = data.get("token")
    
    if not token:
        logger.error("❌ [VERIFY] No token provided")
        raise HTTPException(status_code=400, detail="Verification token is required")
    
    logger.info(f"🔍 [VERIFY] Looking up user with token: {token[:8]}...")
    
    # Find user with this token
    user = await users_collection.find_one({"verificationToken": token})
    
    if not user:
        logger.error(f"❌ [VERIFY] No user found with token: {token[:8]}...")
        raise HTTPException(status_code=404, detail="Invalid verification token")
    
    logger.info(f"✅ [VERIFY] User found: {user.get('email')}")
    
    # Check if token has expired
    if user.get("verificationExpiry"):
        expiry = user["verificationExpiry"]
        
        # Convert string to datetime if needed
        if isinstance(expiry, str):
            try:
                from datetime import datetime as dt
                expiry = dt.fromisoformat(expiry.replace('Z', '+00:00'))
            except:
                # If parsing fails, treat as expired
                logger.error(f"❌ [VERIFY] Invalid verification token format for: {user.get('email')}")
                raise HTTPException(status_code=400, detail="Invalid verification token format")
        
        # Make datetime timezone-aware for comparison
        from datetime import timezone
        now = datetime.now(timezone.utc)
        
        # Ensure expiry is timezone-aware
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        
        # Compare with current time
        if expiry < now:
            logger.warning(f"⏰ [VERIFY] Token expired for: {user.get('email')}")
            raise HTTPException(status_code=400, detail="Verification token has expired")
    
    # Check if already verified
    if user.get("emailVerified"):
        logger.info(f"ℹ️  [VERIFY] Email already verified for: {user.get('email')}")
        return {
            "success": True,
            "message": "Email already verified"
        }
    
    # Mark email as verified
    logger.info(f"📝 [VERIFY] Updating user to verified: {user.get('email')}")
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "emailVerified": True,
            "verificationToken": None,
            "verificationExpiry": None,
            "lastActive": datetime.utcnow()
        }}
    )
    
    logger.info(f"🎉 [VERIFY] Email verified successfully for: {user.get('email')}")
    return {
        "success": True,
        "message": "Email verified successfully"
    }

# ==================== USER ROUTES ====================

@app.get("/user/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Count goals and achievements
    goals_count = await goals_collection.count_documents({"userId": str(user["_id"])})
    achievements_count = await achievements_collection.count_documents({"userId": str(user["_id"])})
    
    # Update last active
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastActive": datetime.utcnow()}}
    )
    
    return {
        "success": True,
        "data": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user["email"],
            "username": user.get("username"),
            "level": user.get("level", 1),
            "totalPoints": user.get("totalPoints", 0),
            "rank": user.get("rank", "E"),
            "title": user.get("title", "Awakened Hunter"),
            "loginPlatform": user.get("loginPlatform", "email"),
            "joinedAt": user.get("joinedAt"),
            "lastActive": user.get("lastActive"),
            "preferences": user.get("preferences", {}),
            "_count": {
                "goals": goals_count,
                "achievements": achievements_count
            }
        }
    }

# ==================== METRICS ROUTES ====================

@app.get("/metrics/dashboard")
async def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    """Get dashboard metrics for current user"""
    logger.info(f"📊 [METRICS] Fetching dashboard metrics for: {current_user['email']}")
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    # Get all goals
    all_goals = await goals_collection.find({"userId": user_id}).to_list(length=1000)
    
    # Calculate overall metrics
    total_goals = len(all_goals)
    completed_goals = len([g for g in all_goals if g.get("completed")])
    active_goals = len([g for g in all_goals if g.get("status") == "active"])
    completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
    
    # Calculate category metrics
    categories = ["productivity", "learning", "career", "fitness", "personal"]
    category_metrics = []
    
    for category in categories:
        cat_goals = [g for g in all_goals if g.get("category") == category]
        cat_total = len(cat_goals)
        cat_completed = len([g for g in cat_goals if g.get("completed")])
        cat_active = len([g for g in cat_goals if g.get("status") == "active"])
        cat_rate = (cat_completed / cat_total * 100) if cat_total > 0 else 0
        
        category_metrics.append({
            "category": category,
            "total": cat_total,
            "completed": cat_completed,
            "active": cat_active,
            "completionRate": round(cat_rate, 1)
        })
    
    # Calculate streak (simplified - consecutive days with completed goals)
    # For now, just return 0 - can be enhanced later with proper date tracking
    current_streak = 0
    longest_streak = 0
    
    logger.info(f"✅ [METRICS] Metrics calculated successfully")
    return {
        "success": True,
        "data": {
            "overview": {
                "totalGoals": total_goals,
                "completedGoals": completed_goals,
                "activeGoals": active_goals,
                "completionRate": round(completion_rate, 1),
                "currentStreak": current_streak,
                "longestStreak": longest_streak,
                "totalPoints": user.get("totalPoints", 0),
                "level": user.get("level", 1)
            },
            "categories": category_metrics
        }
    }

# ==================== GOALS ROUTES ====================

@app.get("/debug/all-goals")
async def debug_all_goals():
    """DEBUG: Get all goals from database to diagnose user ID issues"""
    try:
        goals_cursor = goals_collection.find({})
        goals = await goals_cursor.to_list(length=100)
        
        # Get all unique userIds
        user_ids = set()
        for goal in goals:
            goal["_id"] = str(goal["_id"])
            user_ids.add(goal.get("userId"))
        
        # Get users for those IDs
        users_info = {}
        for uid in user_ids:
            if uid:
                from bson import ObjectId
                try:
                    user = await users_collection.find_one({"_id": ObjectId(uid)})
                    if user:
                        users_info[uid] = user.get("email", "unknown")
                except:
                    users_info[uid] = "invalid_id"
        
        return {
            "total_goals": len(goals),
            "goals": goals,
            "user_ids_with_emails": users_info
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/goals")
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for current user"""
    result = await GoalService.get_user_goals(current_user["email"])
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@app.post("/goals", status_code=201)
async def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new goal"""
    logger.info(f"🎯 [GOALS] Creating goal for user: {current_user['email']}")
    result = await GoalService.create_goal(
        user_email=current_user["email"],
        title=goal.title,
        description=goal.description,
        category=goal.category,
        priority=goal.priority,
        target_date=goal.targetDate,
        tags=goal.tags
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.put("/goals/{goal_id}")
async def update_goal(goal_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update goal"""
    logger.info(f"✏️ [GOALS] Updating goal {goal_id} for user: {current_user['email']}")
    result = await GoalService.update_goal(current_user["email"], goal_id, update_data)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    logger.info(f"✅ [GOALS] Goal {goal_id} updated successfully")
    return result

@app.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a goal"""
    result = await GoalService.delete_goal(current_user["email"], goal_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# ==================== COACH/CHAT ROUTES ====================

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with AI coach"""
    try:
        user_message = request.message

        if not user_message:
            raise HTTPException(
                status_code=400, detail="Missing 'message' in request body"
            )

        # Use LLM service to handle chat
        response_text = await llm_service.chat(
            messages=[{"role": "user", "content": user_message}],
            user_id=None,
            system_prompt=None,
            user_email=None
        )

        return ChatResponse(
            responseText=response_text,
            threadId="",
            runId=""
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STOCKS ROUTES ====================

@app.get("/stocks/search/{query}")
async def search_stocks(query: str, current_user: dict = Depends(get_current_user)):
    """Search for stocks by symbol or name"""
    logger.info(f"📈 [STOCKS] Searching for: {query}")
    results = await StockService.search_stocks(query)
    return {
        "success": True,
        "data": results
    }

@app.get("/stocks/quote/{symbol}")
async def get_stock_quote(symbol: str, current_user: dict = Depends(get_current_user)):
    """Get current quote for a stock"""
    logger.info(f"📈 [STOCKS] Fetching quote for: {symbol}")
    quote = await StockService.get_stock_quote(symbol)
    
    if not quote:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    return {
        "success": True,
        "data": quote
    }

@app.get("/stocks/watchlist")
async def get_watchlist(current_user: dict = Depends(get_current_user)):
    """Get user's stock watchlist with current quotes"""
    logger.info(f"📈 [STOCKS] Fetching watchlist for: {current_user['email']}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's watchlist
    watchlist = user.get("stockPreferences", {}).get("watchlist", [])
    
    # Fetch quotes for all symbols
    quotes = await StockService.get_multiple_quotes(watchlist)
    
    return {
        "success": True,
        "data": {
            "watchlist": watchlist,
            "quotes": quotes
        }
    }

@app.post("/stocks/watchlist/add")
async def add_to_watchlist(stock: StockSymbol, current_user: dict = Depends(get_current_user)):
    """Add a stock to user's watchlist"""
    logger.info(f"📈 [STOCKS] Adding {stock.symbol} to watchlist for: {current_user['email']}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify stock exists
    quote = await StockService.get_stock_quote(stock.symbol)
    if not quote:
        raise HTTPException(status_code=404, detail="Stock symbol not found")
    
    # Get current stock preferences or initialize
    stock_prefs = user.get("stockPreferences", {"watchlist": []})
    watchlist = stock_prefs.get("watchlist", [])
    
    # Add symbol if not already in watchlist
    symbol_upper = stock.symbol.upper()
    if symbol_upper not in watchlist:
        watchlist.append(symbol_upper)
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"stockPreferences": {"watchlist": watchlist}}}
        )
        
        logger.info(f"✅ [STOCKS] Added {symbol_upper} to watchlist")
        return {
            "success": True,
            "message": f"Added {symbol_upper} to watchlist",
            "data": {"watchlist": watchlist}
        }
    else:
        return {
            "success": True,
            "message": f"{symbol_upper} already in watchlist",
            "data": {"watchlist": watchlist}
        }

@app.delete("/stocks/watchlist/{symbol}")
async def remove_from_watchlist(symbol: str, current_user: dict = Depends(get_current_user)):
    """Remove a stock from user's watchlist"""
    logger.info(f"📈 [STOCKS] Removing {symbol} from watchlist for: {current_user['email']}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get current stock preferences or initialize
    stock_prefs = user.get("stockPreferences", {"watchlist": []})
    watchlist = stock_prefs.get("watchlist", [])
    
    # Remove symbol
    symbol_upper = symbol.upper()
    if symbol_upper in watchlist:
        watchlist.remove(symbol_upper)
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"stockPreferences": {"watchlist": watchlist}}}
        )
        
        logger.info(f"✅ [STOCKS] Removed {symbol_upper} from watchlist")
        return {
            "success": True,
            "message": f"Removed {symbol_upper} from watchlist",
            "data": {"watchlist": watchlist}
        }
    else:
        return {
            "success": True,
            "message": f"{symbol_upper} not in watchlist",
            "data": {"watchlist": watchlist}
        }

@app.get("/stocks/history")
async def get_stock_history(symbol: str, period: str = "1mo"):
    """Get historical stock data - public endpoint"""
    logger.info(f"📈 [STOCKS] Fetching history for {symbol}, period: {period}")
    history = await StockService.get_stock_history(symbol, period)
    
    if not history:
        raise HTTPException(status_code=404, detail="Stock history not found")
    
    return {
        "success": True,
        "data": history
    }

# ==================== NEWS ROUTES ====================

@app.get("/news/categories")
async def get_news_categories(current_user: dict = Depends(get_current_user)):
    """Get available news categories"""
    return {
        "success": True,
        "data": {
            "categories": NewsService.get_available_categories()
        }
    }

@app.get("/news/category/{category}")
async def get_news_by_category(category: str, limit: int = 10, current_user: dict = Depends(get_current_user)):
    """Get news articles by category"""
    logger.info(f"📰 [NEWS] Fetching {category} news, limit: {limit}")
    articles = await NewsService.get_news_by_category(category, limit)
    
    return {
        "success": True,
        "data": {
            "category": category,
            "articles": articles,
            "count": len(articles)
        }
    }

@app.get("/news/search/{query}")
async def search_news(query: str, limit: int = 10, current_user: dict = Depends(get_current_user)):
    """Search news articles by keyword"""
    logger.info(f"📰 [NEWS] Searching news for: {query}")
    articles = await NewsService.get_news_by_query(query, limit)
    
    return {
        "success": True,
        "data": {
            "query": query,
            "articles": articles,
            "count": len(articles)
        }
    }

@app.get("/news/trending")
async def get_trending_news(limit: int = 10, current_user: dict = Depends(get_current_user)):
    """Get trending news"""
    logger.info(f"📰 [NEWS] Fetching trending news")
    articles = await NewsService.get_trending_news(limit)
    
    return {
        "success": True,
        "data": {
            "articles": articles,
            "count": len(articles)
        }
    }

@app.get("/news/feed")
async def get_news_feed(current_user: dict = Depends(get_current_user)):
    """Get personalized news feed based on user's subscribed categories"""
    logger.info(f"📰 [NEWS] Fetching news feed for: {current_user['email']}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's subscribed categories
    subscribed_categories = user.get("newsPreferences", {}).get("subscribedCategories", ["business", "technology"])
    
    # Fetch articles from each category
    all_articles = []
    for category in subscribed_categories:
        articles = await NewsService.get_news_by_category(category, limit=5)
        all_articles.extend(articles)
    
    return {
        "success": True,
        "data": {
            "subscribedCategories": subscribed_categories,
            "articles": all_articles,
            "count": len(all_articles)
        }
    }

@app.post("/news/subscribe/{category}")
async def subscribe_to_category(category: str, current_user: dict = Depends(get_current_user)):
    """Subscribe to a news category"""
    logger.info(f"📰 [NEWS] Subscribing {current_user['email']} to {category}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify category exists
    if category not in NewsService.get_available_categories():
        raise HTTPException(status_code=400, detail="Invalid category")
    
    # Get current news preferences or initialize with defaults
    news_prefs = user.get("newsPreferences", {"subscribedCategories": ["business", "technology"]})
    subscribed = news_prefs.get("subscribedCategories", ["business", "technology"])
    
    # Add category if not already subscribed
    if category not in subscribed:
        subscribed.append(category)
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"newsPreferences": {"subscribedCategories": subscribed}}}
        )
        
        logger.info(f"✅ [NEWS] Subscribed to {category}")
        return {
            "success": True,
            "message": f"Subscribed to {category}",
            "data": {"subscribedCategories": subscribed}
        }
    else:
        return {
            "success": True,
            "message": f"Already subscribed to {category}",
            "data": {"subscribedCategories": subscribed}
        }

@app.delete("/news/unsubscribe/{category}")
async def unsubscribe_from_category(category: str, current_user: dict = Depends(get_current_user)):
    """Unsubscribe from a news category"""
    logger.info(f"📰 [NEWS] Unsubscribing {current_user['email']} from {category}")
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get current news preferences or initialize
    news_prefs = user.get("newsPreferences", {"subscribedCategories": []})
    subscribed = news_prefs.get("subscribedCategories", [])
    
    # Remove category
    if category in subscribed:
        subscribed.remove(category)
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"newsPreferences": {"subscribedCategories": subscribed}}}
        )
        
        logger.info(f"✅ [NEWS] Unsubscribed from {category}")
        return {
            "success": True,
            "message": f"Unsubscribed from {category}",
            "data": {"subscribedCategories": subscribed}
        }
    else:
        return {
            "success": True,
            "message": f"Not subscribed to {category}",
            "data": {"subscribedCategories": subscribed}
        }

@app.get("/news/preferences")
async def get_news_preferences(current_user: dict = Depends(get_current_user)):
    """Get user's news preferences"""
    user = await users_collection.find_one({"email": current_user["email"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscribed = user.get("newsPreferences", {}).get("subscribedCategories", ["business", "technology"])
    
    return {
        "success": True,
        "data": {
            "subscribedCategories": subscribed,
            "availableCategories": NewsService.get_available_categories()
        }
    }

# ==================== LLM/AI COACH ROUTES ====================

@app.post("/llm/chat")
async def llm_chat(request: dict, current_user: dict = Depends(get_current_user)):
    """
    Chat with LLM (Azure AI Foundry or Ollama) with function calling support
    Request body: { "message": "your message", "include_goals": true/false }
    """
    logger.info(f"🤖 [LLM] Chat request from: {current_user['email']}")
    
    message = request.get("message")
    include_goals = request.get("include_goals", True)
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        # Get user info for context
        user = await users_collection.find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's current goals if requested
        goals_context = ""
        if include_goals:
            goals = await goals_collection.find({"userId": ObjectId(user["_id"])}).to_list(length=50)
            if goals:
                active_goals = [g for g in goals if not g.get("completed", False)]
                completed_goals = [g for g in goals if g.get("completed", False)]
                
                goals_context += f"\n\nCurrent Active Goals ({len(active_goals)}):"
                for goal in active_goals[:5]:  # Limit to 5 most recent
                    progress = goal.get('progress', 0)
                    goals_context += f"\n- {goal['title']} ({goal['category']}) - {progress}% complete"
                    if goal.get('deadline'):
                        goals_context += f" - Deadline: {goal['deadline']}"
                
                if completed_goals:
                    goals_context += f"\n\nRecently Completed Goals: {len(completed_goals)} total"
        
        # Build user context message (this will be part of the conversation)
        user_context = f"""[USER CONTEXT]
Name: {user.get('name', 'User')}
Level: {user.get('level', 1)}
Rank: {user.get('rank', 'E')}
Title: {user.get('title', 'Awakened Hunter')}
Total XP: {user.get('totalPoints', 0)}{goals_context}

[USER MESSAGE]"""
        
        # Build messages array with context
        messages = [
            {"role": "user", "content": f"{user_context}\n{message}"}
        ]
        
        # Call LLM service with user_email for function calling
        response = await llm_service.chat(
            messages=messages,
            user_id=str(user["_id"]),
            system_prompt=None,  # Let Azure agent use its configured instructions
            user_email=current_user["email"]  # Pass email for database queries
        )
        
        logger.info(f"✅ [LLM] Response generated successfully")
        return {
            "success": True,
            "data": {
                "response": response,
                "provider": llm_service.provider,
                "user_level": user.get('level', 1),
                "user_rank": user.get('rank', 'E')
            }
        }
    
    except Exception as e:
        logger.error(f"❌ [LLM] Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM chat failed: {str(e)}")

@app.post("/llm/goal-suggestion")
async def suggest_goal_improvements(goal_data: dict, current_user: dict = Depends(get_current_user)):
    """Get AI suggestions for improving a goal"""
    logger.info(f"🎯 [LLM] Goal suggestion request from: {current_user['email']}")
    
    try:
        goal_title = goal_data.get("title", "")
        goal_description = goal_data.get("description", "")
        goal_category = goal_data.get("category", "")
        
        if not goal_title:
            raise HTTPException(status_code=400, detail="Goal title is required")
        
        # Build prompt for goal analysis
        system_prompt = "You are a goal-setting expert. Analyze goals and provide specific, actionable suggestions for improvement."
        
        user_message = f"""Analyze this goal and suggest improvements:

Title: {goal_title}
Description: {goal_description}
Category: {goal_category}

Provide:
1. A more specific and measurable goal statement
2. 3-5 concrete action steps
3. Potential obstacles and how to overcome them
4. A realistic timeline

Keep your response concise and actionable."""
        
        messages = [{"role": "user", "content": user_message}]
        
        response = await llm_service.chat(
            messages=messages,
            system_prompt=system_prompt
        )
        
        return {
            "success": True,
            "data": {
                "suggestions": response,
                "provider": llm_service.provider
            }
        }
    
    except Exception as e:
        logger.error(f"❌ [LLM] Goal suggestion error: {e}")
        raise HTTPException(status_code=500, detail=f"Goal suggestion failed: {str(e)}")

@app.post("/llm/chat/stream")
async def chat_stream_sse(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Stream chat responses via Server-Sent Events (SSE)
    Uses Azure AI Foundry agent with function calling
    """
    user_email = current_user.get("email")
    logger.info(f"💬 [CHAT/STREAM] New chat request from {user_email}")
    logger.info(f"💬 [CHAT/STREAM] Message: {request.message}")
    logger.info(f"🤖 [CHAT/STREAM] Using Azure AI Foundry agent")
    
    async def event_stream():
        """Stream events to client via Azure agent"""
        try:
            # Check if Azure is properly configured
            if llm_service.provider != "azure" or not llm_service.project_client:
                logger.warning("❌ Azure provider not initialized")
                raise Exception("Azure AI Foundry not properly initialized")
            
            agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
            if not agent_id:
                raise Exception("AZURE_EXISTING_AGENT_ID not configured")
            
            logger.info(f"🔗 [CHAT/STREAM] Using agent: {agent_id}")
            
            # Set up context for agent tools
            from agent_tools import (
                get_stock_history, 
                get_user_goals, 
                create_goal, 
                delete_goal, 
                get_news_by_category,
                set_user_email
            )
            import nest_asyncio
            nest_asyncio.apply()
            
            # Set user email for tool context
            set_user_email(user_email)
            logger.info(f"📧 [CHAT/STREAM] User email context set: {user_email}")
            
            # Enable auto function calls
            logger.info("🔧 [CHAT/STREAM] Enabling auto function calls")
            llm_service.project_client.agents.enable_auto_function_calls(
                tools={get_stock_history, get_user_goals, create_goal, delete_goal, get_news_by_category},
                max_retry=5
            )
            
            # Create thread
            thread = llm_service.project_client.agents.threads.create()
            thread_id = thread.id
            logger.info(f"📌 [CHAT/STREAM] Created thread: {thread_id}")
            
            # Add user message to thread
            llm_service.project_client.agents.messages.create(
                thread_id=thread_id,
                role="user",
                content=request.message
            )
            logger.info(f"✉️  [CHAT/STREAM] Added message to thread")
            
            # Stream status updates
            data = json.dumps({
                "type": "status",
                "status": "processing",
                "done": False
            })
            yield f"data: {data}\n\n"
            
            # Run agent with auto function calls
            logger.info("🚀 [CHAT/STREAM] Running agent with auto function calls")
            run = llm_service.project_client.agents.runs.create_and_process(
                thread_id=thread_id,
                agent_id=agent_id
            )
            
            logger.info(f"📊 [CHAT/STREAM] Run completed: {run.status}")
            
            # Check for errors
            if run.status == "failed":
                error_msg = run.last_error.message if run.last_error else "Unknown error"
                logger.error(f"❌ [CHAT/STREAM] Agent run failed: {error_msg}")
                raise Exception(f"Agent run failed: {error_msg}")
            
            if run.status != "completed":
                raise Exception(f"Unexpected run status: {run.status}")
            
            # Get response messages
            from azure.ai.agents.models import ListSortOrder
            messages_list = llm_service.project_client.agents.messages.list(
                thread_id=thread_id,
                order=ListSortOrder.ASCENDING
            )
            
            # Find assistant response from this run
            response_text = ""
            for message in reversed(list(messages_list)):
                if message.run_id == run.id and message.text_messages:
                    response_text = message.text_messages[-1].text.value
                    logger.info(f"📝 [CHAT/STREAM] Got response: {response_text[:100]}...")
                    break
            
            if not response_text:
                raise Exception("No assistant response found from agent")
            
            # Stream response in chunks
            chunk_size = 50
            for i in range(0, len(response_text), chunk_size):
                chunk = response_text[i:i+chunk_size]
                data = json.dumps({
                    "type": "text",
                    "content": chunk,
                    "done": False
                })
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.02)
            
            # Send completion signal
            done_data = json.dumps({
                "type": "complete",
                "done": True,
                "thread_id": thread_id,
                "run_id": run.id
            })
            yield f"data: {done_data}\n\n"
            
            logger.info(f"✅ [CHAT/STREAM] Stream completed successfully")
            
        except Exception as e:
            logger.error(f"💥 [CHAT/STREAM] Error in stream: {e}")
            import traceback
            logger.error(traceback.format_exc())
            error_data = json.dumps({
                "type": "error",
                "error": str(e)
            })
            yield f"data: {error_data}\n\n"
    
    try:
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive"
            }
        )
    except Exception as e:
        logger.error(f"❌ [CHAT/STREAM] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat stream failed: {str(e)}")


@app.get("/llm/health")
async def llm_health_check():
    """Check LLM service health"""
    logger.info("🏥 [LLM] Health check requested")
    try:
        health_status = await llm_service.health_check()
        return {
            "success": True,
            "data": health_status
        }
    except Exception as e:
        logger.error(f"❌ [LLM] Health check failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ==================== CHAT THREAD ROUTES ====================

@app.get("/threads")
async def list_threads(current_user: dict = Depends(get_current_user)):
    """List all chat threads for the current user"""
    user_email = current_user.get("email")
    logger.info(f"📋 [THREADS] Listing threads for {user_email}")
    
    try:
        threads = await chat_threads_collection.find(
            {"user_email": user_email}
        ).sort("updated_at", -1).to_list(length=50)
        
        # Convert ObjectId to string
        for thread in threads:
            thread["_id"] = str(thread["_id"])
            thread["created_at"] = thread.get("created_at", "").isoformat() if thread.get("created_at") else ""
            thread["updated_at"] = thread.get("updated_at", "").isoformat() if thread.get("updated_at") else ""
        
        logger.info(f"✅ Found {len(threads)} threads")
        return {
            "success": True,
            "data": threads
        }
    except Exception as e:
        logger.error(f"❌ [THREADS] Error listing threads: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/threads")
async def create_thread(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new chat thread"""
    user_email = current_user.get("email")
    title = data.get("title", "New Chat")
    
    logger.info(f"➕ [THREADS] Creating new thread for {user_email}: {title}")
    
    try:
        thread = {
            "user_email": user_email,
            "title": title,
            "messages": [],
            "file_references": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await chat_threads_collection.insert_one(thread)
        thread["_id"] = str(result.inserted_id)
        
        logger.info(f"✅ Created thread: {thread['_id']}")
        return {
            "success": True,
            "data": thread
        }
    except Exception as e:
        logger.error(f"❌ [THREADS] Error creating thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/threads/{thread_id}")
async def get_thread(thread_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific chat thread"""
    user_email = current_user.get("email")
    logger.info(f"📖 [THREADS] Getting thread {thread_id} for {user_email}")
    
    try:
        thread = await chat_threads_collection.find_one({
            "_id": ObjectId(thread_id),
            "user_email": user_email
        })
        
        if not thread:
            logger.warning(f"⚠️  [THREADS] Thread not found: {thread_id}")
            raise HTTPException(status_code=404, detail="Thread not found")
        
        thread["_id"] = str(thread["_id"])
        logger.info(f"✅ Retrieved thread with {len(thread.get('messages', []))} messages")
        return {
            "success": True,
            "data": thread
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [THREADS] Error getting thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat thread"""
    user_email = current_user.get("email")
    logger.info(f"🗑️  [THREADS] Deleting thread {thread_id} for {user_email}")
    
    try:
        result = await chat_threads_collection.delete_one({
            "_id": ObjectId(thread_id),
            "user_email": user_email
        })
        
        if result.deleted_count == 0:
            logger.warning(f"⚠️  [THREADS] Thread not found for deletion: {thread_id}")
            raise HTTPException(status_code=404, detail="Thread not found")
        
        logger.info(f"✅ Deleted thread: {thread_id}")
        return {
            "success": True,
            "message": f"Thread {thread_id} deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [THREADS] Error deleting thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/threads/{thread_id}/messages")
async def add_message_to_thread(
    thread_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Add a message to a thread"""
    user_email = current_user.get("email")
    message_content = data.get("message")
    sender = data.get("sender", "user")  # "user" or "assistant"
    
    logger.info(f"💬 [THREADS] Adding message to thread {thread_id}")
    
    try:
        message = {
            "role": sender,
            "content": message_content,
            "timestamp": datetime.utcnow()
        }
        
        result = await chat_threads_collection.update_one(
            {
                "_id": ObjectId(thread_id),
                "user_email": user_email
            },
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            logger.warning(f"⚠️  [THREADS] Thread not found: {thread_id}")
            raise HTTPException(status_code=404, detail="Thread not found")
        
        logger.info(f"✅ Message added to thread")
        return {
            "success": True,
            "data": message
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [THREADS] Error adding message: {e}")
        raise HTTPException(status_code=500, detail=str(e))
