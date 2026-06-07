# End-to-End Testing Guide for Solo Levelling Chat System

## Architecture Overview

The refactored system uses a clean layered architecture with Vercel AI SDK on the frontend:

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend (Port 3000)            │
├─────────────────────────────────────────────────────────────┤
│  User Input (ChatInterface)                                 │
│           ↓                                                   │
│  useChat Hook (from Vercel AI SDK + auth wrapper)            │
│           ↓                                                   │
│  POST /api/chat (Next.js proxy route)                        │
├─────────────────────────────────────────────────────────────┤

┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                │
├─────────────────────────────────────────────────────────────┤
│  POST /api/chat (ChatRouter)                                │
│           ↓                                                   │
│  ChatService.handle_message()                               │
│           ↓                                                   │
│  ThreadService.get_or_create_user_thread()                  │
│           ↓                                                   │
│  UserService.get_user_profile()                             │
│           ↓                                                   │
│  LLMService.chat_with_agent()                               │
│           ↓                                                   │
│  Azure AI Foundry (gpt-4o with auto function calling)       │
│           ↓                                                   │
│  Response with reply, thread_id, events, metadata           │
├─────────────────────────────────────────────────────────────┤

┌─────────────────────────────────────────────────────────────┐
│              MongoDB (Port 27017)                           │
├─────────────────────────────────────────────────────────────┤
│  chat_threads: Persistent conversation history              │
│  users: User profiles and preferences                       │
│  goals: User goals and progress tracking                    │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Services Running**: All three containers should be running
   - Next.js app on port 3000
   - FastAPI on port 8000  
   - MongoDB on port 27017

2. **Valid NextAuth Session**: User must be signed in

3. **Environment Variables**:
   - `NEXT_PUBLIC_FASTAPI_URL`: Points to FastAPI service
   - `AZURE_ASSISTANT_ID`: Azure AI agent ID
   - `AZURE_API_KEY`: Azure credentials

## Step 1: Verify Infrastructure

### Check Container Status

```bash
docker compose ps
```

Expected output:
```
SERVICE     STATUS
app         Up (seconds)  # Next.js
fastapi     Up (minutes)  # FastAPI
mongodb     Up (minutes, healthy)
```

### Check FastAPI Health

```bash
curl -s http://localhost:8000/health | jq
```

Expected response:
```json
{
  "status": "ok",
  "service": "Solo Levelling API"
}
```

### Check Next.js is Ready

```bash
curl -s -I http://localhost:3000 | head -5
```

Expected: HTTP/1.1 200 OK

## Step 2: Verify Authentication

### Open Chat Interface (requires login)

1. Navigate to: `http://localhost:3000/coach`
2. You will be redirected to signin if not authenticated
3. Sign in with test credentials (or create account)
4. After auth, you should see the chat interface

### Verify NextAuth Session

```bash
curl -s http://localhost:3000/api/auth/session | jq
```

Expected: Session object with user email and JWT token

## Step 3: Test Chat Flow

### Option A: Manual API Testing

Send a message through the proxy route:

```bash
# Get session cookie first (requires interactive browser session)
# For automated testing, include auth token:

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are my current goals?"}' \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

### Option B: Browser Test (Recommended)

1. Open `http://localhost:3000/coach` in browser (must be signed in)
2. Type a message in the chat input: "What are my current goals?"
3. Click send button
4. Watch the console (F12 → Console tab) for:
   - Request to `/api/chat`
   - Response with `reply`, `thread_id`, `events`
   - Message appearing in chat

### Expected Behavior

**Frontend (ChatInterface):**
- Input field clears after sending
- Message appears in chat with user role
- Loading indicator shows while processing
- AI response appears with assistant role
- Each message includes timestamp

**Console Logs:**
```
[CHAT_API] Sending message to FastAPI...
[CHAT_API] Response: { reply: "...", thread_id: "...", events: [...] }
```

**Network Tab (F12 → Network):**
- POST /api/chat request
- Status: 200 OK
- Response includes: content, reply, thread_id, events, metadata

## Step 4: Verify Database Integration

### Check Thread Creation in MongoDB

Connect to MongoDB and verify thread was created:

```bash
# Connect to MongoDB inside container
docker exec solo-leveling-mongodb mongosh

# In MongoDB shell:
use solo_leveling
db.chat_threads.findOne({ user_email: "your@email.com" })
```

Expected response includes:
- `_id`: Thread ID
- `user_email`: Your email
- `azure_thread_id`: Azure thread ID
- `messages`: Array of message objects
- `created_at`, `updated_at`: Timestamps

## Step 5: Test Core Features

### Feature 1: Persistent Threads

**Test**: Send multiple messages in the same session
**Expected**: All messages appear in conversation history
**Verify**: `db.chat_threads.findOne().messages.length > 1`

### Feature 2: User Context

**Test**: Send message "What's my profile?"
**Expected**: AI includes user goals, preferences in response
**Verify**: FastAPI logs show user context enrichment

### Feature 3: Goal Management

**Test**: Use chat to create/manage goals
**Expected**: Changes persisted to MongoDB
**Verify**: 
```bash
db.goals.find({ user_email: "your@email.com" })
```

### Feature 4: Vercel AI SDK Features

**Test**: Rapid message sending
**Expected**: Messages queued properly, sent sequentially
**Verify**: No duplicate requests, proper message ordering

## Debugging Guide

### Issue: "Unauthorized: Please sign in first"

**Cause**: No valid NextAuth session
**Solution**:
1. Visit `http://localhost:3000/coach`
2. You'll be redirected to signin
3. Complete authentication
4. Return to chat

### Issue: "Failed to fetch from FastAPI"

**Cause**: FastAPI not running or endpoint unreachable
**Solution**:
```bash
# Check FastAPI is running
docker compose ps | grep fastapi

# Check container logs
docker compose logs fastapi --tail 50

# Restart FastAPI
docker compose restart fastapi
```

### Issue: Chat hangs/no response

**Cause**: Azure agent not responding or threading issue
**Solution**:
1. Check FastAPI logs for errors:
   ```bash
   docker compose logs fastapi --tail 100 | grep -i error
   ```

2. Verify Azure credentials:
   ```bash
   docker exec solo-leveling-fastapi env | grep AZURE
   ```

3. Check thread was created in MongoDB:
   ```bash
   docker exec solo-leveling-mongodb mongosh
   use solo_leveling
   db.chat_threads.count()
   ```

### Issue: Next.js build warnings

**Resolution**: Already fixed - dynamic params warnings resolved in `/api/threads/[id]` routes

## Performance Testing

### Load Test: Rapid Message Sending

1. Open DevTools Network tab (F12)
2. Send 5-10 messages rapidly
3. Observe:
   - Messages queue properly
   - No parallel requests (Vercel AI SDK enforces serial)
   - Each message processed in order
   - No race conditions

### Latency Measurements

Test endpoint response time:

```bash
time curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}' \
  -H "Cookie: $SESSION"
```

Expected breakdown:
- Next.js route handling: ~50-100ms
- FastAPI processing: ~100-200ms
- Azure agent call: ~2000-5000ms (varies by complexity)
- **Total**: ~2-5 seconds typical

## Integration Checklist

- [ ] All 3 containers running (app, fastapi, mongodb)
- [ ] FastAPI /health endpoint responds
- [ ] NextAuth session created after signin
- [ ] Can navigate to /coach without redirect
- [ ] Chat message sends successfully
- [ ] AI response appears in UI
- [ ] Message stored in MongoDB chat_threads
- [ ] Thread ID persists across messages
- [ ] No console errors or warnings
- [ ] Network requests show 200 responses
- [ ] Rapid messages queue properly
- [ ] User context enriched in responses

## API Reference

### Frontend Endpoint: POST /api/chat

**Request:**
```json
{
  "message": "What are my current goals?"
}
```

**Response:**
```json
{
  "content": "I can see you have the following goals...",
  "reply": "I can see you have the following goals...",
  "thread_id": "650a1c2b3d4e5f6g7h8i9j0k",
  "events": [
    {
      "type": "function_call",
      "name": "get_goals",
      "result": [...]
    }
  ],
  "metadata": {
    "model": "gpt-4o",
    "tokens": 256
  }
}
```

### Backend Endpoint: POST /api/chat (FastAPI)

**Internal Use Only**

Request includes:
- `message`: User message
- `user_email`: (from auth)
- `thread_id`: (optional, auto-created if not present)

Response includes all above plus:
- Events from function calls
- Full message history
- User context applied

## Next Steps

After verification:

1. **Streaming Enhancement**: Implement chunk-based response streaming for real-time feedback
2. **Conversation History UI**: Add pagination for loading older messages
3. **Monitoring**: Set up logging dashboard for performance tracking
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Caching**: Add response caching for common queries

## Support

**Container Logs:**
```bash
# Frontend
docker compose logs app -f

# Backend  
docker compose logs fastapi -f

# Database
docker compose logs mongodb -f
```

**Full Stack Restart:**
```bash
docker compose down && docker compose up -d
```

---

**Last Updated**: After Vercel AI SDK Integration
**Architecture Version**: v2.0 (Layered with AI SDK)
**Status**: ✅ All components verified running
