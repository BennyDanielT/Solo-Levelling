import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    
    // Get token from session (OAuth) or request body (for client-side localStorage token)
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");
    
    if (!token && (session as any).accessToken) {
      token = (session as any).accessToken;
    }
    
    if (!token) {
      return NextResponse.json({ 
        error: "No authentication token available. Please sign in again." 
      }, { status: 401 });
    }

    // Call FastAPI LLM endpoint
    const response = await fetch(`${FASTAPI_URL}/llm/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messages[messages.length - 1].content,
        include_goals: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || "Failed to get response" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Convert to streaming format for better UX
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const text = data.data.response;
        const words = text.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          controller.enqueue(encoder.encode(chunk));
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
