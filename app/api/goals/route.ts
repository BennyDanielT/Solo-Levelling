import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'

async function getAuthToken(session: any) {
  // In a real implementation, you'd exchange the NextAuth session for a FastAPI JWT
  // For now, we'll pass the email and let FastAPI handle it
  return session?.user?.email
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
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
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('Get goals proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
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
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    console.error('Create goal proxy error', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}