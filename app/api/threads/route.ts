import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger, getPrivacySafeUserId } from "@/lib/logger"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || process.env.FASTAPI_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const route = "/api/threads"

  logger.info(`GET ${route} - Fetching chat threads`, {
    route,
    method: "GET",
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`GET ${route} - User not authenticated`, {
        route,
        method: "GET",
        request_id: requestId,
        user_id: userId,
        status: 401,
        latency_ms: latency,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${FASTAPI_URL}/threads`, {
      headers: {
        Authorization: `Bearer ${session.user.email}`,
      },
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
      logger.warn(`GET ${route} - Backend returned error`, {
        route,
        method: "GET",
        request_id: requestId,
        user_id: userId,
        status: response.status,
        latency_ms: latency,
      })
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: response.status })
    }

    const data = await response.json()
    logger.info(`GET ${route} - Request succeeded`, {
      route,
      method: "GET",
      request_id: requestId,
      user_id: userId,
      status: 200,
      latency_ms: latency,
    })

    return NextResponse.json({ threads: data.data || [] }, { status: 200 })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`GET ${route} - Proxy error`, {
      route,
      method: "GET",
      request_id: requestId,
      user_id: userId,
      status: 500,
      latency_ms: latency,
      error_type: error?.name || "Error",
      error_message: error?.message || String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const route = "/api/threads"

  logger.info(`POST ${route} - Creating chat thread`, {
    route,
    method: "POST",
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`POST ${route} - User not authenticated`, {
        route,
        method: "POST",
        request_id: requestId,
        user_id: userId,
        status: 401,
        latency_ms: latency,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${FASTAPI_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.email}`,
      },
      body: JSON.stringify(body),
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
      logger.warn(`POST ${route} - Backend returned error`, {
        route,
        method: "POST",
        request_id: requestId,
        user_id: userId,
        status: response.status,
        latency_ms: latency,
      })
      return NextResponse.json({ error: "Failed to create thread" }, { status: response.status })
    }

    const data = await response.json()
    logger.info(`POST ${route} - Request succeeded`, {
      route,
      method: "POST",
      request_id: requestId,
      user_id: userId,
      status: 201,
      latency_ms: latency,
    })

    return NextResponse.json(data.data || data, { status: 201 })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`POST ${route} - Proxy error`, {
      route,
      method: "POST",
      request_id: requestId,
      user_id: userId,
      status: 500,
      latency_ms: latency,
      error_type: error?.name || "Error",
      error_message: error?.message || String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

