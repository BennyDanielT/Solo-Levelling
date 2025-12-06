from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserPreferences(BaseModel):
    theme: str = "dark"
    notifications: bool = True
    language: str = "en"

class UserBase(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    username: Optional[str] = None
    image: Optional[str] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password: str
    level: int = 1
    totalPoints: int = 0
    rank: str = "E"
    title: str = "Awakened Hunter"
    loginPlatform: str = "email"
    platformId: Optional[str] = None
    joinedAt: datetime = Field(default_factory=datetime.utcnow)
    lastActive: datetime = Field(default_factory=datetime.utcnow)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    username: Optional[str]
    level: int
    totalPoints: int
    rank: str
    title: str
    loginPlatform: str
    joinedAt: datetime
    lastActive: datetime
    preferences: UserPreferences

# Goal Models
class GoalBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    category: str = Field(..., description="productivity, learning, career, fitness, personal")
    priority: str = "medium"  # low, medium, high
    targetDate: Optional[datetime] = None
    status: str = "active"  # active, completed, archived
    progress: int = Field(default=0, ge=0, le=100)
    tags: List[str] = []

class GoalCreate(GoalBase):
    pass

class GoalInDB(GoalBase):
    id: str = Field(alias="_id")
    userId: str
    completed: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: Optional[datetime] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class GoalResponse(GoalBase):
    id: str
    userId: str
    completed: bool
    createdAt: datetime
    completedAt: Optional[datetime]
    updatedAt: datetime

# Metrics Models
class DashboardMetrics(BaseModel):
    totalGoals: int = 0
    completedGoals: int = 0
    activeGoals: int = 0
    completionRate: float = 0.0
    currentStreak: int = 0
    longestStreak: int = 0
    totalPoints: int = 0
    level: int = 1
    
class CategoryMetrics(BaseModel):
    category: str
    total: int = 0
    completed: int = 0
    active: int = 0
    completionRate: float = 0.0

# Achievement Models
class AchievementBase(BaseModel):
    type: str  # "companion" or "item"
    name: str
    description: Optional[str] = None
    iconPath: Optional[str] = None
    rarity: str = "common"
    category: Optional[str] = None
    source: Optional[str] = None
    pointsRequired: int

class AchievementInDB(AchievementBase):
    id: str = Field(alias="_id")
    userId: str
    unlockedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AchievementResponse(AchievementBase):
    id: str
    userId: str
    unlockedAt: datetime

# Chat Models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    responseText: str
    threadId: str
    runId: str

# Stock Models
class StockSymbol(BaseModel):
    symbol: str

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    high: Optional[float] = None
    low: Optional[float] = None
    open: Optional[float] = None
    previousClose: Optional[float] = None
    volume: Optional[int] = None
    marketCap: Optional[int] = None
    currency: str = "USD"
    exchange: Optional[str] = None
    timestamp: str

class UserStockPreferences(BaseModel):
    watchlist: List[str] = []  # List of stock symbols

# News Models
class NewsArticle(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    url: str
    imageUrl: Optional[str] = None
    source: str
    publishedAt: str
    category: str
    author: Optional[str] = None

class UserNewsPreferences(BaseModel):
    subscribedCategories: List[str] = ["business", "technology"]  # Default categories
