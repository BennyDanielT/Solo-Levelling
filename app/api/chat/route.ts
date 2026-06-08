import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Use FASTAPI_SERVICE_URL (Docker) or FASTAPI_URL (local) for server-side requests
const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * POST /api/chat
 * 
 * Handles chat messages by:
 * 1. Authenticating the user via NextAuth
 * 2. Extracting the message and optional thread_id from request body
 * 3. Forwarding to FastAPI backend (/api/chat)
 * 4. Returning structured response to AI SDK
 * 
 * Expected request body:
 * { 
 *   "message": "user message text",
 *   "threadId": "optional_thread_id"  // Pass to continue conversation
 * }
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
    const threadId = body.threadId;  // Optional thread ID for conversation continuation

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid message field" },
        { status: 400 }
      );
    }

    // Get auth token - use session email as fallback (consistent with threads API)
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    if (!token && (session as any).accessToken) {
      token = (session as any).accessToken;
    }

    // Fallback to using email as token (FastAPI accepts this)
    if (!token) {
      token = session.user.email;
    }

    console.log(`[CHAT_API] Message from ${session.user.email}: ${message.slice(0, 50)}...`);
    if (threadId) {
      console.log(`[CHAT_API] Using thread: ${threadId}`);
    }

    // Call FastAPI chat endpoint with optional thread_id
    const response = await fetch(`${FASTAPI_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        message,
        ...(threadId && { thread_id: threadId })  // Include thread_id if provided
      }),
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

    // Extract the assistant message and thread ID
    const assistantReply = data.reply || "";
    const responseThreadId = data.thread_id;

    // Return response in frontend format
    // Frontend expects: { messages: [...], thread_id: "..." }
    return NextResponse.json({
      reply: assistantReply,
      thread_id: responseThreadId,
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: assistantReply }
      ],
      metadata: data.metadata || {}
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

