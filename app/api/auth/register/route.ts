import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'
const FRONTEND_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    console.log('🔵 [REGISTER] Starting registration process for:', email)

    if (!email || !password) {
      console.error('❌ [REGISTER] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    console.log('🔑 [REGISTER] Generated verification token (24h expiry)')

    // Create user in FastAPI backend with unverified status
    console.log('🔵 [REGISTER] Calling FastAPI at:', `${FASTAPI_URL}/auth/register`)
    const response = await fetch(`${FASTAPI_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        emailVerified: false,
        verificationToken,
        verificationExpiry: verificationExpiry.toISOString(),
      }),
    })

    const data = await response.json()
    console.log('📥 [REGISTER] FastAPI response status:', response.status)

    if (!response.ok) {
      console.error('❌ [REGISTER] FastAPI registration failed:', data)
      return NextResponse.json(
        { error: data.detail || 'Registration failed' },
        { status: response.status }
      )
    }
    console.log('✅ [REGISTER] User created in database successfully')

    // Send verification email via Resend
    console.log('📧 [REGISTER] Preparing to send verification email...')
    console.log('🔑 [REGISTER] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)
    console.log('🌐 [REGISTER] FRONTEND_URL:', FRONTEND_URL)
    try {
      const verificationUrl = `${FRONTEND_URL}/api/auth/verify-email?token=${verificationToken}`
      console.log('🔗 [REGISTER] Verification URL:', verificationUrl)
      
      console.log('📤 [REGISTER] Sending email via Resend to:', email)
      const emailResponse = await resend.emails.send({
        from: 'Life Hacker <noreply@maxeffortgazette.com>',
        to: email,
        subject: 'Verify your Life Hacker account',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .logo {
                  font-size: 48px;
                  margin-bottom: 10px;
                }
                .header h1 {
                  color: white;
                  margin: 0;
                  font-size: 28px;
                }
                .content {
                  background: #ffffff;
                  padding: 40px 30px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                  color: white;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 8px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .footer {
                  background: #f9fafb;
                  padding: 20px 30px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  border-radius: 0 0 10px 10px;
                  text-align: center;
                  font-size: 14px;
                  color: #6b7280;
                }
                .code {
                  background: #f3f4f6;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: monospace;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">⚡</div>
                <h1>Welcome to Life Hacker!</h1>
              </div>
              <div class="content">
                <h2>Hi ${name || 'there'}! 👋</h2>
                <p>Thanks for signing up! We're excited to have you join our community.</p>
                <p>To get started, please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;"><span class="code">${verificationUrl}</span></p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Life Hacker. All rights reserved.</p>
                <p>Questions? Reply to this email or contact us at support@leveluphq.com</p>
              </div>
            </body>
          </html>
        `,
      })

      console.log('✅ [REGISTER] Verification email sent successfully!')
      console.log('📬 [REGISTER] Full email response:', JSON.stringify(emailResponse, null, 2))
      console.log('📬 [REGISTER] Email ID:', emailResponse?.data?.id || emailResponse?.id)
      console.log('📧 [REGISTER] Recipient:', email)
      
      // Check for errors in response
      if (emailResponse?.error) {
        console.error('⚠️  [REGISTER] Resend returned error:', emailResponse.error)
        throw new Error(emailResponse.error.message || 'Email send failed')
      }
    } catch (emailError: any) {
      console.error('❌ [REGISTER] Failed to send verification email')
      console.error('❌ [REGISTER] Error details:', emailError)
      console.error('❌ [REGISTER] Error message:', emailError?.message)
      console.error('❌ [REGISTER] Error name:', emailError?.name)
      if (emailError?.statusCode) {
        console.error('❌ [REGISTER] Status code:', emailError.statusCode)
      }
      
      // Check if it's a Resend validation error
      if (emailError?.message?.includes('testing emails to your own email')) {
        return NextResponse.json({
          error: 'Email verification is in testing mode. Please sign up with benny28dany@gmail.com or verify a domain at resend.com/domains',
          user: data.user,
        }, { status: 400 })
      }
      
      // User is created but email failed - return success anyway
      return NextResponse.json({
        message: 'Account created, but verification email failed to send. Please contact support.',
        user: data.user,
        debug: {
          error: emailError?.message || 'Unknown error',
          hasApiKey: !!process.env.RESEND_API_KEY
        }
      })
    }

    console.log('🎉 [REGISTER] Registration complete - email verification sent')
    return NextResponse.json({
      message: 'Account created! Check your email to verify.',
      user: data.user,
    })
  } catch (error: any) {
    console.error('❌ [REGISTER] Registration error:', error)
    console.error('❌ [REGISTER] Error stack:', error?.stack)
    return NextResponse.json(
      { success: false, error: 'Internal server error', debug: error?.message },
      { status: 500 }
    )
  }
}