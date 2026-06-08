import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'

export const dynamic = 'force-dynamic'

async function getAuthToken(session: any) {
  return session?.accessToken || session?.user?.email
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const subpath = params.path.join('/')
    const { search } = new URL(request.url)
    const targetUrl = `${FASTAPI_URL}/news/${subpath}${search}`
    const token = await getAuthToken(session)

    // Prepare request init
    const init: RequestInit = {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }

    // Include body for POST/PUT/PATCH if it exists
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
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
    if (data) {
      return NextResponse.json(data, { status: response.status })
    } else {
      return new NextResponse(null, { status: response.status })
    }

  } catch (error) {
    console.error(`News proxy error for ${request.method} ${request.url}:`, error)
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
