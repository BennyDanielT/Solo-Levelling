import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

/**
 * POST /api/chat
 * 
 * Handles chat messages by:
 * 1. Authenticating the user via NextAuth
 * 2. Extracting the message from request body
 * 3. Forwarding to FastAPI backend (/api/chat)
 * 4. Returning structured response to AI SDK
 * 
 * Expected request body:
 * { "message": "user message text" }
 * 
 * Expected response:
 * {
 *   "reply": "assistant response",
 *   "thread_id": "thread_xyz",
 *   "events": [...],
 *   "metadata": {...}
 * }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in first" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid message field" },
        { status: 400 }
      );
    }

    // Get auth token
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    if (!token && (session as any).accessToken) {
      token = (session as any).accessToken;
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    console.log(`[CHAT_API] Message from ${session.user.email}: ${message.slice(0, 50)}...`);

    // Call FastAPI chat endpoint
    const response = await fetch(`${FASTAPI_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      console.error(`[CHAT_API] FastAPI error: ${response.status}`, errorData);

      return NextResponse.json(
        { error: errorData.detail || `FastAPI error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the assistant message
    const assistantReply = data.data?.reply || data.reply || "";

    // Return response in AI SDK format
    // The AI SDK expects a text response that gets streamed
    return NextResponse.json({
      content: assistantReply,
      // Optional: Include metadata for AI SDK
      ...(data.data || data),
    });
  } catch (error) {
    console.error("[CHAT_API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
