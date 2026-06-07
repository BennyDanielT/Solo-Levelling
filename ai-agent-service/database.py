from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Try MONGODB_URL first (Azure), fall back to DATABASE_URL (local), with local default fallback
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL") or "mongodb://admin:solo-leveling-2024@localhost:27017/solo_levelling?authSource=admin"

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client.solo_levelling

# Collections
users_collection = db.users
goals_collection = db.goals
achievements_collection = db.achievements
sessions_collection = db.sessions
chat_threads_collection = db.chat_threads

async def ping_db():
    """Test database connection"""
    try:
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
