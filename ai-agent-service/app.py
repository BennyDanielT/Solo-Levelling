from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from azure.ai.agents import AgentsClient
from azure.identity import DefaultAzureCredential
from datetime import datetime, timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv
import time

from database import (
    db, users_collection, goals_collection, achievements_collection, ping_db
)
from models import (
    UserRegister, UserResponse, UserInDB,
    GoalCreate, GoalResponse, GoalInDB,
    AchievementResponse,
    ChatRequest, ChatResponse
)
from auth import hash_password, verify_password, create_access_token, get_current_user

load_dotenv()

app = FastAPI(title="Solo Levelling API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def register(user: UserRegister):
    """Register a new user"""
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    if user.username:
        existing_username = await users_collection.find_one({"username": user.username})
        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username is already taken"
            )
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user document
    user_doc = {
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "password": hashed_password,
        "image": user.image,
        "level": 1,
        "totalPoints": 0,
        "rank": "E",
        "title": "Awakened Hunter",
        "loginPlatform": "email",
        "platformId": None,
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
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "user": {
                "id": str(result.inserted_id),
                "name": user.name,
                "email": user.email,
                "username": user.username,
                "level": 1,
                "totalPoints": 0,
                "rank": "E",
                "title": "Awakened Hunter"
            },
            "token": access_token
        }
    }

@app.post("/auth/login")
async def login(credentials: dict):
    """Login user"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=422,
            detail="Email and password are required"
        )
    
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Update last active
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastActive": datetime.utcnow()}}
    )
    
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
        return {"success": True, "message": "User updated"}
    
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
        "joinedAt": datetime.utcnow(),
        "lastActive": datetime.utcnow(),
        "preferences": {
            "theme": "dark",
            "notifications": True,
            "language": "en"
        }
    }
    
    result = await users_collection.insert_one(user_doc)
    
    return {
        "success": True,
        "message": "User created",
        "data": {
            "id": str(result.inserted_id),
            "email": email,
            "name": name
        }
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

# ==================== GOALS ROUTES ====================

@app.get("/goals")
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for current user"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    goals_cursor = goals_collection.find({"userId": str(user["_id"])}).sort("createdAt", -1)
    goals = await goals_cursor.to_list(length=100)
    
    # Convert ObjectId to string
    for goal in goals:
        goal["id"] = str(goal.pop("_id"))
    
    return {
        "success": True,
        "data": goals
    }

@app.post("/goals", status_code=201)
async def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new goal"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate points if not provided
    points = goal.points if goal.points else int(goal.weight * 2)
    
    goal_doc = {
        "title": goal.title,
        "description": goal.description,
        "weight": goal.weight,
        "difficulty": goal.difficulty,
        "points": points,
        "category": goal.category,
        "priority": goal.priority,
        "tags": goal.tags,
        "userId": str(user["_id"]),
        "completed": False,
        "archived": False,
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

@app.put("/goals/{goal_id}")
async def update_goal(goal_id: str, completed: bool, current_user: dict = Depends(get_current_user)):
    """Update goal completion status"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    goal = await goals_collection.find_one({
        "_id": ObjectId(goal_id),
        "userId": str(user["_id"])
    })
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = {
        "completed": completed,
        "updatedAt": datetime.utcnow()
    }
    
    if completed and not goal.get("completed"):
        update_data["completedAt"] = datetime.utcnow()
        # Award points
        points = goal.get("points", 0)
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$inc": {"totalPoints": points}}
        )
    
    await goals_collection.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Goal updated successfully"
    }

@app.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a goal"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await goals_collection.delete_one({
        "_id": ObjectId(goal_id),
        "userId": str(user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {
        "success": True,
        "message": "Goal deleted successfully"
    }

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

        # Create client
        credential = DefaultAzureCredential()
        client = AgentsClient(PROJECT_ENDPOINT, credential)

        # Create thread
        thread = client.threads.create()
        print(f"Created thread: {thread.id}")

        # Create message
        message = client.messages.create(
            thread_id=thread.id, role="user", content=user_message
        )
        print(f"Created message: {message.id}")

        # Run agent
        run = client.runs.create(thread_id=thread.id, agent_id=AGENT_ID)
        print(f"Created run: {run.id}")

        # Wait for completion
        run_status = run.status
        while run_status == "queued" or run_status == "in_progress":
            time.sleep(1)
            updated_run = client.runs.get(thread_id=thread.id, run_id=run.id)
            run_status = updated_run.status
            print(f"Run status: {run_status}")

        # Retrieve messages
        messages = client.messages.list(thread_id=thread.id, order="asc")

        response_text = ""
        for msg in messages:
            if msg.role == "assistant":
                for content in msg.content:
                    if content.type == "text":
                        response_text = content.text.value
                        break

        return ChatResponse(
            responseText=response_text, threadId=thread.id, runId=run.id
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
