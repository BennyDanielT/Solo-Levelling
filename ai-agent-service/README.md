# Solo Levelling FastAPI Backend

FastAPI backend service for the Solo Levelling application with MongoDB integration.

## Features

- ✅ User authentication (register/login with JWT)
- ✅ Goals management (CRUD operations)
- ✅ User profiles with stats
- ✅ Azure AI Agent chat integration
- ✅ MongoDB with Motor (async driver)

## Setup

### Install Dependencies

Using poetry:
```bash
poetry install
```

### Environment Variables

Create a `.env` file in the `ai-agent-service` directory:

```env
DATABASE_URL=mongodb://localhost:27017/solo_levelling
NEXTAUTH_SECRET=your-secret-key-here
AZURE_AI_PROJECT_ENDPOINT=your-azure-endpoint
AZURE_EXISTING_AGENT_ID=your-agent-id
```

### Run the Server

```bash
# Development with poetry
poetry run uvicorn app:app --reload --port 8000

# Or activate poetry shell first
poetry shell
uvicorn app:app --reload --port 8000
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### User
- `GET /user/profile` - Get user profile (requires auth)

### Goals
- `GET /goals` - Get all goals (requires auth)
- `POST /goals` - Create new goal (requires auth)
- `PUT /goals/{goal_id}` - Update goal (requires auth)
- `DELETE /goals/{goal_id}` - Delete goal (requires auth)

### Chat
- `POST /chat` - Chat with AI coach

### Health
- `GET /health` - Health check

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "username": "string (unique, optional)",
  "password": "string (hashed)",
  "level": "number",
  "totalPoints": "number",
  "rank": "string",
  "title": "string",
  "loginPlatform": "string",
  "joinedAt": "datetime",
  "lastActive": "datetime",
  "preferences": {
    "theme": "string",
    "notifications": "boolean",
    "language": "string"
  }
}
```

### Goals Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "title": "string",
  "description": "string",
  "weight": "number (1-100)",
  "difficulty": "string (easy/medium/hard)",
  "points": "number",
  "completed": "boolean",
  "archived": "boolean",
  "category": "string",
  "priority": "string",
  "tags": ["string"],
  "createdAt": "datetime",
  "completedAt": "datetime",
  "updatedAt": "datetime"
}
```

### Achievements Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "type": "string",
  "name": "string",
  "description": "string",
  "iconPath": "string",
  "rarity": "string",
  "category": "string",
  "source": "string",
  "pointsRequired": "number",
  "unlockedAt": "datetime"
}
```

## Architecture

- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver for Python
- **Pydantic**: Data validation using Python type annotations
- **JWT**: Token-based authentication
- **Azure AI Agents**: AI coach integration
- **Bcrypt**: Password hashing

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```
