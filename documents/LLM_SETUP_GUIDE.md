# LLM Integration Setup Guide

This guide explains how to set up both **Azure AI Foundry** and **Ollama** LLM integrations for the Solo Levelling app.

## Overview

The app supports two LLM providers:
1. **Azure AI Foundry** (Cloud, GPT-4o) - For production
2. **Ollama** (Local, Llama 3.2) - For development/cost savings

Switch between providers using the `LLM_PROVIDER` environment variable.

---

## Part 1: Azure AI Foundry Setup

### Prerequisites
- Azure subscription
- Azure CLI installed and logged in

### Step 1: Create Azure AI Foundry Project

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create \
  --name solo-leveling-ai-rg \
  --location canadaeast

# Create AI Hub (requires Azure AI Foundry extension)
az extension add --name ml

# Create Azure AI project
az ml workspace create \
  --name solo-leveling-ai \
  --resource-group solo-leveling-ai-rg \
  --location canadaeast
```

### Step 2: Get Project Endpoint

1. Go to [Azure AI Foundry](https://ai.azure.com)
2. Select your project
3. Go to **Settings** → **Project details**
4. Copy the **Project endpoint** URL

### Step 3: Create an Agent

```bash
# Using Python
from azure.ai.agents import AgentsClient
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
client = AgentsClient(
    endpoint="YOUR_PROJECT_ENDPOINT",
    credential=credential
)

# Create agent
agent = client.agents.create(
    model="gpt-4o",
    name="Solo Levelling Coach",
    instructions="You are a helpful life coach and productivity assistant."
)

print(f"Agent ID: {agent.id}")
```

### Step 4: Update Environment Variables

Add to `.env`:
```bash
# Azure AI Foundry
LLM_PROVIDER=azure
AZURE_AI_PROJECT_ENDPOINT=https://your-project.services.ai.azure.com/api/projects/your-project
AZURE_EXISTING_AGENT_ID=asst_xxxxx
```

### Step 5: Test Azure AI Foundry

```bash
# Restart FastAPI
docker compose restart fastapi

# Test health endpoint
curl http://localhost:8000/llm/health

# Test chat
curl -X POST http://localhost:8000/llm/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me?"}'
```

---

## Part 2: Ollama Setup (Local)

### Step 1: Start Ollama Container

```bash
# Start Ollama (already in docker-compose.yml)
docker compose up -d ollama

# Check if running
docker ps | grep ollama
```

### Step 2: Pull a Model

```bash
# Pull Llama 3.2 (default)
docker exec -it solo-leveling-ollama ollama pull llama3.2

# Or pull other models:
# docker exec -it solo-leveling-ollama ollama pull llama3.2:1b  # Smaller, faster
# docker exec -it solo-leveling-ollama ollama pull llama3.2:3b  # Medium
# docker exec -it solo-leveling-ollama ollama pull mistral      # Alternative
# docker exec -it solo-leveling-ollama ollama pull codellama    # Code-focused
```

### Step 3: Update Environment Variables

Update `.env`:
```bash
# Ollama (Local)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
```

### Step 4: Restart Services

```bash
# Restart FastAPI to pick up new env vars
docker compose restart fastapi

# Check logs
docker compose logs -f fastapi
```

### Step 5: Test Ollama

```bash
# Test health endpoint
curl http://localhost:8000/llm/health

# Should return:
# {
#   "success": true,
#   "data": {
#     "provider": "ollama",
#     "status": "ok",
#     "base_url": "http://ollama:11434",
#     "model": "llama3.2",
#     "available_models": ["llama3.2:latest"]
#   }
# }

# Test chat
curl -X POST http://localhost:8000/llm/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me 3 tips for staying productive"
  }'
```

---

## API Endpoints

### 1. Health Check
```bash
GET /llm/health
```
Returns LLM provider status and available models.

### 2. Chat
```bash
POST /llm/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Your question here",
  "context": "Optional additional context"
}
```

### 3. Goal Suggestions
```bash
POST /llm/goal-suggestion
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learn Python",
  "description": "Want to learn programming",
  "category": "learning"
}
```
Returns AI-generated suggestions for improving the goal.

---

## Performance & Cost Comparison

| Provider | Model | Speed | Cost | Best For |
|----------|-------|-------|------|----------|
| **Azure AI Foundry** | GPT-4o | Fast | $$$ | Production, complex reasoning |
| **Ollama** | Llama 3.2 (3B) | Medium | Free | Development, privacy, cost savings |
| **Ollama** | Llama 3.2 (1B) | Fast | Free | Quick responses, lower quality |

---

## Switching Between Providers

Just change `LLM_PROVIDER` in `.env` and restart:

```bash
# Switch to Azure
echo "LLM_PROVIDER=azure" >> .env
docker compose restart fastapi

# Switch to Ollama
echo "LLM_PROVIDER=ollama" >> .env
docker compose restart fastapi
```

---

## Troubleshooting

### Azure AI Foundry Issues

**Problem**: `DefaultAzureCredential failed to retrieve a token`
**Solution**: 
```bash
# Login to Azure
az login

# Set subscription
az account set --subscription YOUR_SUBSCRIPTION_ID
```

**Problem**: `Project endpoint not found`
**Solution**: Verify the endpoint URL in Azure AI Foundry portal.

### Ollama Issues

**Problem**: `Connection refused to ollama:11434`
**Solution**: 
```bash
# Check if Ollama is running
docker ps | grep ollama

# Restart Ollama
docker compose restart ollama
```

**Problem**: `Model not found`
**Solution**: Pull the model first:
```bash
docker exec -it solo-leveling-ollama ollama pull llama3.2
```

**Problem**: Ollama is slow
**Solution**: 
- Use a smaller model (llama3.2:1b)
- Enable GPU support in docker-compose.yml
- Increase Docker memory/CPU allocation

---

## Next Steps

1. **Azure Setup**: Follow Part 1 to create Azure AI Foundry project
2. **Ollama Setup**: Follow Part 2 to start local Ollama
3. **Test Both**: Try both providers and compare results
4. **Integrate Frontend**: Add chat UI in Next.js dashboard
5. **Add Features**: Goal analysis, habit suggestions, motivational coaching

---

## Resources

- [Azure AI Foundry Docs](https://learn.microsoft.com/en-us/azure/ai-studio/)
- [Ollama Models](https://ollama.com/library)
- [Azure AI Agents SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-agents-readme)
