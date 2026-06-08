import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Use FASTAPI_SERVICE_URL (Docker) or FASTAPI_URL (local) for server-side requests
const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${FASTAPI_URL}/threads`, {
      headers: {
        Authorization: `Bearer ${session.user.email}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch threads" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    // Transform backend response to frontend format
    // Backend returns: { success: true, data: [...] }
    // Frontend expects: { threads: [...] }
    return new Response(JSON.stringify({ threads: data.data || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    const response = await fetch(`${FASTAPI_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.email}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to create thread" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    // Transform backend response to frontend format
    // Backend returns: { thread_id: "...", ... } or { success: true, data: {...} }
    // Frontend expects thread object directly
    return new Response(JSON.stringify(data.data || data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

