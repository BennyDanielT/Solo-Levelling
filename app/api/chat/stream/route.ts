import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, threadId, chatHistory } = await request.json();

    // Stream response from FastAPI SSE endpoint
    const response = await fetch(`${FASTAPI_URL}/llm/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.email}`,
      },
      body: JSON.stringify({
        message,
        thread_id: threadId,
        chat_history: chatHistory || [],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to stream" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the streaming response
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
