import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Use FASTAPI_SERVICE_URL (Docker) or FASTAPI_URL (local) for server-side requests
const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${FASTAPI_URL}/threads/${id}`, {
      headers: {
        Authorization: `Bearer ${session.user.email}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${FASTAPI_URL}/threads/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.user.email}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to delete thread" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
