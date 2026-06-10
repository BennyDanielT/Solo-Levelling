import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger, getPrivacySafeUserId } from '@/lib/logger'
import crypto from 'crypto'

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'

export const dynamic = 'force-dynamic'

async function getAuthToken(session: any) {
  return session?.accessToken || session?.user?.email
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)

  logger.info(`GET /api/goals - Fetching user goals`, {
    route: '/api/goals',
    method: 'GET',
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`GET /api/goals - User not authenticated`, {
        route: '/api/goals',
        method: 'GET',
        request_id: requestId,
        user_id: userId,
        status: 401,
        latency_ms: latency,
      })
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/goals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken(session)}`,
      },
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    logger.info(`GET /api/goals - Request succeeded`, {
      route: '/api/goals',
      method: 'GET',
      request_id: requestId,
      user_id: userId,
      status: response.status,
      latency_ms: latency,
    })
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`GET /api/goals - Proxy error`, {
      route: '/api/goals',
      method: 'GET',
      request_id: requestId,
      user_id: userId,
      status: 500,
      latency_ms: latency,
      error_type: error?.name || 'Error',
      error_message: error?.message || String(error),
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)

  logger.info(`POST /api/goals - Creating goal`, {
    route: '/api/goals',
    method: 'POST',
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`POST /api/goals - User not authenticated`, {
        route: '/api/goals',
        method: 'POST',
        request_id: requestId,
        user_id: userId,
        status: 401,
        latency_ms: latency,
      })
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${FASTAPI_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken(session)}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    logger.info(`POST /api/goals - Request succeeded`, {
      route: '/api/goals',
      method: 'POST',
      request_id: requestId,
      user_id: userId,
      status: response.status,
      latency_ms: latency,
    })
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`POST /api/goals - Proxy error`, {
      route: '/api/goals',
      method: 'POST',
      request_id: requestId,
      user_id: userId,
      status: 500,
      latency_ms: latency,
      error_type: error?.name || 'Error',
      error_message: error?.message || String(error),
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
