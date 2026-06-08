import { NextResponse } from "next/server";

interface RequestBody {
  message?: string;
}

interface ChatResponse {
  responseText: string;
  threadId: string;
  runId: string;
}

const FASTAPI_SERVICE_URL =
  process.env.FASTAPI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the user message from the request body
    const body = (await request.json()) as RequestBody;
    const userMessage = body.message;

    console.log("[Coach API] Received message:", userMessage);
    console.log("[Coach API] FastAPI URL:", FASTAPI_SERVICE_URL);

    if (!userMessage) {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    // Call FastAPI service
    console.log("[Coach API] Calling FastAPI...");
    const response = await fetch(`${FASTAPI_SERVICE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    console.log("[Coach API] FastAPI response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Coach API] FastAPI error:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "FastAPI service error" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as ChatResponse;
    console.log("[Coach API] Success:", data);

    return NextResponse.json({
      responseText: data.responseText,
      threadId: data.threadId,
      runId: data.runId,
    });
  } catch (error) {
    console.error("[Coach API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response from Azure AI Agent.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
