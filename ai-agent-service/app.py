from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from azure.ai.agents import AgentsClient
from azure.identity import DefaultAzureCredential
import os
from dotenv import load_dotenv
import time

load_dotenv()

app = FastAPI(title="Azure AI Agent Service")

# Environment Configuration
PROJECT_ENDPOINT = (
    os.getenv("AZURE_AI_PROJECT_ENDPOINT")
    or "https://rbc-interview-resource.services.ai.azure.com/api/projects/rbc-interview"
)
AGENT_ID = os.getenv("AZURE_EXISTING_AGENT_ID") or "asst_xxx"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    responseText: str
    threadId: str
    runId: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message

        if not user_message:
            raise HTTPException(
                status_code=400, detail="Missing 'message' in request body"
            )

        # Create client
        credential = DefaultAzureCredential()
        client = AgentsClient(PROJECT_ENDPOINT, credential)

        # Create thread
        thread = client.threads.create()
        print(f"Created thread: {thread.id}")

        # Create message (fixed signature)
        message = client.messages.create(
            thread_id=thread.id, role="user", content=user_message
        )
        print(f"Created message: {message.id}")

        # Run agent
        run = client.runs.create(thread_id=thread.id, agent_id=AGENT_ID)
        print(f"Created run: {run.id}")

        # Wait for completion
        run_status = run.status
        while run_status == "queued" or run_status == "in_progress":
            time.sleep(1)
            updated_run = client.runs.get(thread_id=thread.id, run_id=run.id)
            run_status = updated_run.status
            print(f"Run status: {run_status}")

        # Retrieve messages
        messages = client.messages.list(thread_id=thread.id, order="asc")

        response_text = ""
        for msg in messages:
            if msg.role == "assistant":
                for content in msg.content:
                    if content.type == "text":
                        response_text = content.text.value
                        break

        return ChatResponse(
            responseText=response_text, threadId=thread.id, runId=run.id
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
