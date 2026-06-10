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

async function handleProxy(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const subpath = params.path.join('/')
  const route = `/api/stocks/${subpath}`
  const method = request.method

  logger.info(`${method} ${route} - Proxying to backend`, {
    route,
    method,
    request_id: requestId,
    user_id: userId,
  })

  try {
    if (!session?.user?.email) {
      const latency = Date.now() - startTime
      logger.warn(`${method} ${route} - User not authenticated`, {
        route,
        method,
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

    const { search } = new URL(request.url)
    const targetUrl = `${FASTAPI_URL}/stocks/${subpath}${search}`
    const token = await getAuthToken(session)

    // Prepare request init
    const init: RequestInit = {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }

    // Include body for POST/PUT/PATCH if it exists
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const bodyText = await request.text()
        init.body = bodyText
        init.headers = {
          ...init.headers,
          'Content-Type': 'application/json',
        }
      }
    }

    const response = await fetch(targetUrl, init)
    const data = await response.json().catch(() => null)
    const latency = Date.now() - startTime

    logger.info(`${method} ${route} - Request succeeded`, {
      route,
      method,
      request_id: requestId,
      user_id: userId,
      status: response.status,
      latency_ms: latency,
    })

    if (data) {
      return NextResponse.json(data, { status: response.status })
    } else {
      return new NextResponse(null, { status: response.status })
    }

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`${method} ${route} - Proxy error`, {
      route,
      method,
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

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context)
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context)
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context)
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context)
}
