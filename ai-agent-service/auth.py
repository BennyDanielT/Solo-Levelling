import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

SECRET_KEY = os.getenv("NEXTAUTH_SECRET", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token or email"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    from loguru import logger
    
    try:
        token = credentials.credentials
        logger.debug(f"🔐 Attempting to authenticate with token: {token[:20]}...")
        
        # Check if token looks like an email (for OAuth users)
        if "@" in token and "." in token:
            logger.info(f"✅ Token is email format, authenticating as: {token}")
            return {"email": token}
        
        # Try to decode as JWT token (for credentials login)
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                logger.warning("⚠️ Token decoded but no 'sub' field")
                raise credentials_exception
            logger.info(f"✅ JWT token authenticated as: {email}")
            return {"email": email}
        except JWTError as e:
            logger.error(f"❌ JWT decode failed: {e}")
            raise credentials_exception
            
    except Exception as e:
        logger.error(f"❌ Authentication failed: {e}")
        raise credentials_exception
