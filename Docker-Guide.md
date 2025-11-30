I'll help you spin up the entire Solo Levelling app using Docker Compose. Let me first check if you have all the necessary environment variables and configuration files in place.
Ran tool
Read file: Dockerfile
Now let me check if there are any environment files or additional configuration needed:
Ran tool
Read file: scripts/mongo-init.js
Perfect! Now I have a complete picture of your setup. Here's how to spin up your entire Solo Levelling app using Docker Compose:

## Step-by-Step Instructions

### 1. **Prerequisites Check**
Make sure you have Docker and Docker Compose installed on your Windows machine. You can verify by running:
```bash
docker --version
```
```bash
docker-compose --version
```
Great! Docker and Docker Compose are installed. Now let's spin up your application:

### 2. **Build and Start All Services**
```bash
docker-compose up --build -d
```
It looks like Docker Desktop isn't running. Let me start Docker Desktop first:
```bash
Start-Process "Docker Desktop"
```
Let me try a different approach to start Docker Desktop:
```bash
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
Perfect! Docker Desktop is now starting in the background. Let's wait a moment for it to fully start up and then try our Docker Compose command again:

## Instructions to Spin Up Your Solo Levelling App

### Prerequisites
1. Docker and Docker Compose installed
2. `.env` file configured (copy from `.env.example`)

### Architecture
The app now uses a **microservices architecture**:
- **Next.js Frontend** (port 3000) - UI and routing
- **FastAPI Backend** (port 8000) - MongoDB operations, auth, API endpoints
- **MongoDB** (port 27017) - Database
- **Mongo Express** (port 8081) - Database admin UI

### **Step 1: Configure Environment Variables**
```bash
# Copy and edit the environment file
cp .env.example .env
# Make sure to set:
# - MONGO_ROOT_USER and MONGO_ROOT_PASS
# - NEXTAUTH_SECRET
# - AZURE_AI_PROJECT_ENDPOINT and AZURE_EXISTING_AGENT_ID
```

### **Step 2: Start All Services**
```bash
docker-compose up --build -d
```

This will:
- Start MongoDB with initialization
- Build and start FastAPI backend service
- Build and start Next.js frontend
- Start Mongo Express UI

### **Step 3: Check Service Status**
```bash
docker-compose ps
```

### **Step 4: Access Your Applications**

Once running:
1. **Solo Levelling App**: http://localhost:3000
2. **FastAPI Backend**: http://localhost:8000 (API docs at http://localhost:8000/docs)
3. **MongoDB Web UI (Mongo Express)**: http://localhost:8081
4. **MongoDB**: localhost:27017

### **Service Details:**

1. **FastAPI Backend** (`fastapi` service):
   - Handles all MongoDB operations
   - User authentication with JWT
   - Goals, achievements, user profile APIs
   - Azure AI Agent chat integration
   
2. **Next.js Frontend** (`app` service):
   - Proxies API requests to FastAPI
   - Handles UI rendering and routing
   - NextAuth for session management

3. **MongoDB** (`mongodb` service):
   - Database: `solo_levelling`
   - Collections: `users`, `goals`, `achievements`

### **Useful Commands:**

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs fastapi
docker-compose logs app
docker-compose logs mongodb

# Restart a specific service
docker-compose restart fastapi

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild specific service
docker-compose up --build fastapi
```

### **Troubleshooting:**

1. **Check all services are running**: `docker-compose ps`
2. **View logs for errors**: `docker-compose logs -f`
3. **Ensure ports are free**: 3000, 8000, 8081, 27017
4. **Restart services**: `docker-compose restart`
5. **Check FastAPI health**: `curl http://localhost:8000/health`