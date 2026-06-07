# Testing Guide for Refactored Architecture

## Quick Tests

### 1. Health Checks
```bash
# FastAPI backend
curl http://localhost:8000/health

# Next.js frontend
curl http://localhost:3000/health
```

### 2. API Endpoint Tests (Requires Authentication)

#### Test Goals Endpoint
```bash
# List goals (requires valid JWT token)
curl -X GET http://localhost:8000/api/goals \
  -H "Authorization: Bearer <your-token>"

# Create goal
curl -X POST http://localhost:8000/api/goals \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Run 5km",
    "description": "Complete a 5km run",
    "category": "fitness",
    "priority": "high",
    "targetDate": "2025-12-31"
  }'
```

#### Test User Endpoint
```bash
# Get user profile
curl -X GET http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer <your-token>"

# Get dashboard metrics
curl -X GET http://localhost:8000/api/user/metrics \
  -H "Authorization: Bearer <your-token>"
```

#### Test Chat Endpoint
```bash
# Send a message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me set a fitness goal"}'
```

### 3. Manual UI Testing

1. **Navigate to Chat Page**
   - URL: `http://localhost:3000/coach`
   - Should see empty chat with welcome message

2. **Send a Message**
   - Type: "What are my current goals?"
   - Expected: Message sent to backend, response appears in chat

3. **Create Goal via Chat**
   - Type: "Create a goal to read 10 books this year"
   - Expected: Azure agent creates goal and responds with confirmation

4. **View Metrics**
   - Navigate to dashboard
   - Should show updated goal count and completion metrics

## Architecture Verification Checklist

- [ ] **Frontend Separation**
  - [ ] `ChatInterface.tsx` imports only `useChat` hook
  - [ ] No direct API calls in component
  - [ ] No state management logic in component
  - [ ] Component is purely presentational

- [ ] **Backend Service Layer**
  - [ ] `ChatService.handle_message()` coordinates flow
  - [ ] `ThreadService` manages persistent threads
  - [ ] `UserService` aggregates user data
  - [ ] Services are called from API endpoints only

- [ ] **API Layer**
  - [ ] `/api/chat` endpoint exists and responds
  - [ ] `/api/goals` endpoints work (GET, POST, PUT, DELETE)
  - [ ] `/api/user/profile` returns user data
  - [ ] All endpoints require authentication

- [ ] **Azure Agent Integration**
  - [ ] Agent receives enriched messages with context
  - [ ] Thread IDs persist across messages
  - [ ] Function calls work (agent can call tools)
  - [ ] Responses include events and metadata

- [ ] **Data Persistence**
  - [ ] Conversation threads saved to MongoDB
  - [ ] Message history retrievable
  - [ ] User context preserved

## Debugging

### Check if services are running
```bash
docker compose ps
# Should see: fastapi, app, mongodb all running
```

### View FastAPI logs
```bash
docker compose logs fastapi -f
```

### View Next.js logs
```bash
docker compose logs app -f
```

### Test Python imports
```bash
docker compose exec fastapi python3 -c "
from services.chat_service import ChatService
from services.thread_service import ThreadService
from services.user_service import UserService
from api.chat import router
print('✅ All imports successful')
"
```

### Verify MongoDB connection
```bash
docker compose exec fastapi python3 -c "
import asyncio
from database import ping_db
asyncio.run(ping_db())
print('✅ MongoDB connected')
"
```

## Common Issues & Fixes

### Issue: "Module not found: api.chat"
**Cause**: Python path issue  
**Fix**: Ensure `api/__init__.py` exists and is proper

### Issue: "Could not validate credentials" on all requests
**Cause**: Invalid JWT token  
**Fix**: Get a valid token from login endpoint first

### Issue: Chat returns empty response
**Cause**: Azure agent not configured  
**Fix**: Verify `AZURE_EXISTING_AGENT_ID` env var is set

### Issue: Thread not persisting
**Cause**: MongoDB connection issue  
**Fix**: Check MongoDB is running: `docker compose logs mongodb`

## Performance Considerations

- **Chat latency**: Depends on Azure agent response time (typically 2-5 seconds)
- **Throughput**: Can handle multiple concurrent users (stateless FastAPI)
- **Memory**: Minimal - uses thread-local storage for context only
- **Database**: Indexed on userId and threadId for fast lookups

## Next Improvements

1. **Add streaming responses** for faster perceived performance
2. **Implement message pagination** for conversation history
3. **Add event webhooks** for real-time notifications
4. **Create dashboard** for conversation analytics
5. **Add rate limiting** per user
6. **Implement caching** for user context (Redis)
