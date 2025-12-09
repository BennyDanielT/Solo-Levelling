#!/bin/bash

# Quick setup script for LLM integration

echo "🚀 Setting up LLM Integration..."
echo ""

# Check if Ollama is running
if docker ps | grep -q solo-leveling-ollama; then
    echo "✅ Ollama container is running"
else
    echo "❌ Ollama container not running. Starting..."
    docker compose up -d ollama
    sleep 5
fi

# Check if model is downloaded
echo ""
echo "📥 Checking for Llama 3.2 model..."
if docker exec solo-leveling-ollama ollama list | grep -q llama3.2; then
    echo "✅ Llama 3.2 model already downloaded"
else
    echo "⏳ Downloading Llama 3.2 model (this may take a few minutes)..."
    docker exec solo-leveling-ollama ollama pull llama3.2
fi

# Restart FastAPI to load LLM service
echo ""
echo "🔄 Restarting FastAPI service..."
docker compose restart fastapi
sleep 3

# Test health endpoint
echo ""
echo "🏥 Testing LLM health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/llm/health)
echo "$HEALTH_RESPONSE" | jq '.'

# Check status
if echo "$HEALTH_RESPONSE" | jq -e '.data.status == "ok"' > /dev/null; then
    echo ""
    echo "🎉 LLM Integration setup complete!"
    echo ""
    echo "Provider: $(echo "$HEALTH_RESPONSE" | jq -r '.data.provider')"
    echo "Model: $(echo "$HEALTH_RESPONSE" | jq -r '.data.model // "N/A"')"
    echo ""
    echo "Available endpoints:"
    echo "  - GET  /llm/health            - Check LLM status"
    echo "  - POST /llm/chat              - Chat with LLM"
    echo "  - POST /llm/goal-suggestion   - Get goal improvement suggestions"
    echo ""
    echo "To switch providers, update LLM_PROVIDER in .env:"
    echo "  - LLM_PROVIDER=ollama   (local, free)"
    echo "  - LLM_PROVIDER=azure    (cloud, GPT-4o)"
else
    echo ""
    echo "⚠️  LLM service may not be fully ready yet"
    echo "Check logs: docker compose logs fastapi"
fi
