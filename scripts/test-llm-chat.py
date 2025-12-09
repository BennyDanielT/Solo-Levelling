#!/usr/bin/env python3
"""
Test script for LLM chat functionality
Creates a test user, authenticates, and sends a chat message
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def register_test_user():
    """Register a test user"""
    email = f"test_llm_{datetime.now().timestamp()}@example.com"
    payload = {
        "email": email,
        "password": "TestPassword123!",
        "name": "LLM Test User",
        "emailVerified": True  # Skip email verification for testing
    }
    
    print(f"📝 Registering test user: {email}")
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    
    if response.status_code in [200, 201]:
        print(f"✅ User registered successfully")
        return email, payload["password"]
    else:
        print(f"❌ Registration failed: {response.status_code} - {response.text}")
        return None, None

def login_user(email, password):
    """Login and get JWT token"""
    print(f"🔐 Logging in as: {email}")
    
    payload = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        token = result.get("access_token") or result.get("token")
        print(f"✅ Login successful, token received")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_llm_chat(token, message="Hello! Can you help me set a fitness goal to run 5km?"):
    """Test the LLM chat endpoint"""
    print(f"\n💬 Sending message to LLM: '{message}'")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": message,
        "context": "The user is new to fitness and wants to start small."
    }
    
    response = requests.post(
        f"{BASE_URL}/llm/chat",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ LLM Response received!")
        print(f"Provider: {result['data']['provider']}")
        print(f"\n📄 Response:\n{result['data']['response']}\n")
        return True
    else:
        print(f"\n❌ Chat request failed: {response.text}")
        return False

def test_goal_suggestion(token):
    """Test the goal suggestion endpoint"""
    print(f"\n🎯 Testing goal suggestion endpoint")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "goal_text": "Exercise more",
        "category": "fitness"
    }
    
    response = requests.post(
        f"{BASE_URL}/llm/goal-suggestion",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Goal Suggestion received!")
        print(f"\n📄 Suggestion:\n{result['data']['suggestion']}\n")
        return True
    else:
        print(f"\n❌ Goal suggestion failed: {response.text}")
        return False

def main():
    print("=" * 60)
    print("🧪 Testing Azure AI Foundry LLM Integration")
    print("=" * 60)
    
    # Check health first
    print("\n🏥 Checking LLM service health...")
    response = requests.get(f"{BASE_URL}/llm/health")
    if response.status_code == 200:
        health = response.json()["data"]
        print(f"✅ LLM Service Status: {health['status']}")
        print(f"   Provider: {health['provider']}")
        if "endpoint" in health:
            print(f"   Endpoint: {health['endpoint']}")
    else:
        print(f"❌ Health check failed: {response.text}")
        return
    
    # Register and login
    email, password = register_test_user()
    if not email:
        return
    
    token = login_user(email, password)
    if not token:
        return
    
    # Test chat
    print("\n" + "=" * 60)
    print("📝 Test 1: Basic Chat")
    print("=" * 60)
    test_llm_chat(token)
    
    # Test goal suggestion
    print("\n" + "=" * 60)
    print("📝 Test 2: Goal Suggestion")
    print("=" * 60)
    test_goal_suggestion(token)
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
