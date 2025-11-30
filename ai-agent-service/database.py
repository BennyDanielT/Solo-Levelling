from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create MongoDB client
client = AsyncIOMotorClient(DATABASE_URL, server_api=ServerApi('1'))
db = client.solo_levelling

# Collections
users_collection = db.users
goals_collection = db.goals
achievements_collection = db.achievements
sessions_collection = db.sessions

async def ping_db():
    """Test database connection"""
    try:
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
