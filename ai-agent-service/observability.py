import sys
import os
import time
import uuid
import json
import hashlib
from typing import Callable, Optional
from datetime import datetime
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger
from jose import jwt

# Load configuration
ENVIRONMENT = os.getenv("NODE_ENV", "production")
SERVICE_NAME = "solo-leveling-fastapi"
DEPLOYMENT_VERSION = os.getenv("DEPLOYMENT_VERSION", "1.0.0")
SECRET_KEY = os.getenv("NEXTAUTH_SECRET", "your-secret-key-change-this")
ALGORITHM = "HS256"

# 1. Custom JSON Formatter for Loguru
def json_serializer(message):
    record = message.record
    
    # Base structure conforming to Elastic Common Schema (ECS) principles
    log_data = {
        "@timestamp": record["time"].isoformat(),
        "log.level": record["level"].name.lower(),
        "message": record["message"],
        "service": {
            "name": SERVICE_NAME,
            "version": DEPLOYMENT_VERSION,
            "environment": ENVIRONMENT
        },
        "event": {
            "created": datetime.utcnow().isoformat()
        }
    }
    
    # Map any extra context fields (added via logger.bind())
    extra = record["extra"]
    if "request_id" in extra:
        log_data["transaction"] = {"id": extra["request_id"]}
        
    if "route" in extra or "method" in extra:
        log_data["http"] = {
            "request": {
                "method": extra.get("method"),
                "referrer": extra.get("route")
            },
            "response": {
                "status_code": extra.get("status")
            }
        }
        if "latency_ms" in extra:
            log_data["event"]["duration"] = int(extra["latency_ms"] * 1000000) # Event duration in nanoseconds for ECS
            log_data["latency_ms"] = extra["latency_ms"]
            
    if "user_id" in extra:
        log_data["user"] = {"id": extra["user_id"]}
        
    # Map Custom Business/AI metrics
    custom_fields = [
        "tool_name", "agent_name", "model_name", 
        "error_type", "error_message", "mongodb_failure",
        "external_api_call", "api_url"
    ]
    for field in custom_fields:
        if field in extra:
            log_data[field] = extra[field]
            
    # Include exception info if present
    if record["exception"]:
        log_data["error"] = {
            "type": record["exception"].type.__name__,
            "message": str(record["exception"].value),
            "stack_trace": record["exception"].traceback
        }
        
    print(json.dumps(log_data))

# Configure Loguru to use our JSON Formatter
def setup_observability():
    # Remove standard stderr handler
    logger.remove()
    
    # If in development, we can print human-readable colorized console logs
    if ENVIRONMENT == "development":
        logger.add(
            sys.stderr,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            level="DEBUG"
        )
    else:
        # Production: stdout JSON lines for Azure Container Apps / Elastic integrations
        logger.add(json_serializer, level="INFO")
        
    logger.info(f"🚀 Observability initialized for {SERVICE_NAME} [{ENVIRONMENT}]")

# Helper for Hashing Emails to generate Privacy-Safe User IDs
def get_privacy_safe_user_id(email: Optional[str]) -> str:
    if not email:
        return "anonymous"
    return hashlib.sha256(email.lower().strip().encode("utf-8")).hexdigest()[:16]

# Extract user identity from Authorization header without throwing errors
def extract_user_from_header(auth_header: Optional[str]) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        return "anonymous"
    
    token = auth_header.replace("Bearer ", "")
    
    # Check if token is email directly (OAuth configuration fallback)
    if "@" in token and "." in token:
        return get_privacy_safe_user_id(token)
        
    # Attempt to decode as NextAuth JWT token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        return get_privacy_safe_user_id(email)
    except:
        return "invalid_token"

# 2. FastAPI Request Interceptor (Observability Middleware)
class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Exclude health endpoints from logging noise
        if request.url.path in ["/health", "/llm/health"]:
            return await call_next(request)
            
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        user_id = extract_user_from_header(request.headers.get("authorization"))
        start_time = time.time()
        
        # Bind context to this specific request flow
        request_logger = logger.bind(
            request_id=request_id,
            route=request.url.path,
            method=request.method,
            user_id=user_id
        )
        
        request_logger.info(f"📥 Received HTTP {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            latency_ms = round((time.time() - start_time) * 1000, 2)
            
            # Rebind logger with response metrics
            response_logger = request_logger.bind(
                status=response.status_code,
                latency_ms=latency_ms
            )
            
            if response.status_code >= 400:
                response_logger.warning(f"⚠️ Responded HTTP {response.status_code} in {latency_ms}ms")
            else:
                response_logger.info(f"✅ Responded HTTP {response.status_code} in {latency_ms}ms")
                
            return response
            
        except Exception as e:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            error_logger = request_logger.bind(
                status=500,
                latency_ms=latency_ms,
                error_type=e.__class__.__name__,
                error_message=str(e)
            )
            error_logger.exception(f"💥 Failed HTTP {request.method} {request.url.path} - {str(e)}")
            raise e
