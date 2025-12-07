import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'
const FRONTEND_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    console.log('🔍 [VERIFY] Token received:', token?.substring(0, 8) + '...')

    if (!token) {
      console.error('❌ [VERIFY] No token provided')
      return NextResponse.redirect(
        new URL('/auth/signin?error=Invalid verification link', FRONTEND_URL)
      )
    }

    // Verify token with FastAPI backend
    console.log('📤 [VERIFY] Calling FastAPI:', `${FASTAPI_URL}/auth/verify-email`)
    const response = await fetch(`${FASTAPI_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    console.log('📥 [VERIFY] FastAPI response status:', response.status)
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    console.log('📋 [VERIFY] Content-Type:', contentType)
    
    let data
    try {
      const text = await response.text()
      console.log('📄 [VERIFY] Response text:', text)
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ [VERIFY] Failed to parse response as JSON')
      return NextResponse.redirect(
        new URL('/auth/signin?error=Server error - invalid response', FRONTEND_URL)
      )
    }

    if (!response.ok) {
      console.error('❌ [VERIFY] Verification failed:', data)
      return NextResponse.redirect(
        new URL(
          `/auth/signin?error=${encodeURIComponent(data.detail || 'Verification failed')}`,
          FRONTEND_URL
        )
      )
    }

    console.log('✅ [VERIFY] Email verified successfully')
    // Redirect to signin with success message
    return NextResponse.redirect(
      new URL('/auth/signin?verified=true', FRONTEND_URL)
    )
  } catch (error: any) {
    console.error('❌ [VERIFY] Email verification error:', error)
    console.error('❌ [VERIFY] Error message:', error?.message)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Verification failed', FRONTEND_URL)
    )
  }
}
