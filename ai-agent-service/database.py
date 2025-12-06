from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Try MONGODB_URL first (Azure), fall back to DATABASE_URL (local)
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL or DATABASE_URL environment variable is not set")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
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
