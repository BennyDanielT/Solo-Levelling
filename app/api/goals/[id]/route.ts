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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const { id } = params
  const route = `/api/goals/${id}`

  logger.info(`PUT ${route} - Updating user goal`, {
    route,
    method: 'PUT',
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`PUT ${route} - User not authenticated`, {
        route,
        method: 'PUT',
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

    const response = await fetch(`${FASTAPI_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken(session)}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    logger.info(`PUT ${route} - Request succeeded`, {
      route,
      method: 'PUT',
      request_id: requestId,
      user_id: userId,
      status: response.status,
      latency_ms: latency,
    })
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`PUT ${route} - Proxy error`, {
      route,
      method: 'PUT',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const { id } = params
  const route = `/api/goals/${id}`

  logger.info(`DELETE ${route} - Deleting user goal`, {
    route,
    method: 'DELETE',
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`DELETE ${route} - User not authenticated`, {
        route,
        method: 'DELETE',
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

    const response = await fetch(`${FASTAPI_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getAuthToken(session)}`,
      },
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    logger.info(`DELETE ${route} - Request succeeded`, {
      route,
      method: 'DELETE',
      request_id: requestId,
      user_id: userId,
      status: response.status,
      latency_ms: latency,
    })
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`DELETE ${route} - Proxy error`, {
      route,
      method: 'DELETE',
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
