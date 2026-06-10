import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger, getPrivacySafeUserId } from '@/lib/logger'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  const userId = getPrivacySafeUserId(session?.user?.email)
  const { symbol } = params
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "1mo"
  const route = `/api/stocks/history/${symbol}`

  logger.info(`GET ${route} - Fetching stock history`, {
    route,
    method: 'GET',
    request_id: requestId,
    user_id: userId,
    symbol,
    period,
  })

  try {
    const backendUrl = process.env.FASTAPI_SERVICE_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"
    const url = new URL(`${backendUrl}/stocks/history`)
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('period', period)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.warn(`GET ${route} - Backend returned error`, {
        route,
        method: 'GET',
        request_id: requestId,
        user_id: userId,
        status: response.status,
        latency_ms: latency,
        symbol,
        period,
      })
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    logger.info(`GET ${route} - Request succeeded`, {
      route,
      method: 'GET',
      request_id: requestId,
      user_id: userId,
      status: 200,
      latency_ms: latency,
      symbol,
      period,
    })

    return NextResponse.json(data, { status: 200 })

  } catch (error: any) {
    const latency = Date.now() - startTime
    logger.error(`GET ${route} - Proxy error`, {
      route,
      method: 'GET',
      request_id: requestId,
      user_id: userId,
      status: 500,
      latency_ms: latency,
      symbol,
      period,
      error_type: error?.name || 'Error',
      error_message: error?.message || String(error),
    })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock history' },
      { status: 500 }
    )
  }
}
