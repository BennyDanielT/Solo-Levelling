# Email Verification Setup Guide

This guide explains how to set up email verification for user signups using Resend.

## Overview

The email verification system:
- Sends a verification email when users sign up via email/password
- Generates a secure token that expires in 24 hours
- Marks email as verified when user clicks the verification link
- OAuth users (Google) are automatically verified

## Setup Steps

### 1. Get Resend API Key

1. Go to [Resend](https://resend.com)
2. Sign up for a free account (3,000 emails/month, 100 emails/day)
3. Navigate to [API Keys](https://resend.com/api-keys)
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Configure Environment Variable

Add your Resend API key to `.env.local`:

```bash
RESEND_API_KEY=re_your_api_key_here
```

### 3. Update Email Domain (Production)

For production, update the `from` field in `/app/api/auth/register/route.ts`:

```typescript
from: 'Life Hacker <onboarding@yourdomain.com>', // Replace with your verified domain
```

**Important:** In production, you need to verify your domain with Resend:
1. Add your domain in [Resend Domains](https://resend.com/domains)
2. Add the DNS records (SPF, DKIM) to your domain provider
3. Wait for verification (usually a few minutes)

For development, `onboarding@resend.dev` works without verification.

## How It Works

### 1. User Signs Up

When a user signs up via email/password:

```
User fills form → POST /api/auth/register
```

### 2. Backend Processing

```typescript
// Generate verification token
const verificationToken = crypto.randomBytes(32).toString('hex')
const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

// Create user in MongoDB with unverified status
await fetch(`${FASTAPI_URL}/auth/register`, {
  body: JSON.stringify({
    email,
    password,
    emailVerified: false,
    verificationToken,
    verificationExpiry
  })
})

// Send verification email
await resend.emails.send({
  to: email,
  subject: 'Verify your Life Hacker account',
  html: '...' // Email template with verification link
})
```

### 3. User Clicks Verification Link

```
Email link: /api/auth/verify-email?token=abc123
↓
Next.js API route validates token
↓
FastAPI marks emailVerified: true
↓
Redirect to /auth/signin?verified=true
```

### 4. User Signs In

The signin page shows a success message: "Email verified! You can now sign in."

## Database Schema

The user document includes:

```typescript
{
  email: string
  password: string (hashed)
  emailVerified: boolean
  verificationToken: string | null
  verificationExpiry: Date | null
  loginPlatform: 'email' | 'google'
  // ... other fields
}
```

## Email Template

The verification email includes:
- ⚡ Logo with emerald/cyan gradient header
- Personalized greeting with user's name
- "Verify Email Address" button (CTA)
- Plain text link as fallback
- 24-hour expiration notice
- Professional footer with support contact

## OAuth Users

Users who sign up via Google OAuth:
- Skip email verification (Google confirms email)
- `emailVerified` set to `true` automatically
- No verification token stored

## Error Handling

### Invalid Token
- Redirects to: `/auth/signin?error=Invalid verification link`

### Expired Token
- Redirects to: `/auth/signin?error=Verification token has expired`
- User must sign up again

### Email Send Failure
- User is created but gets warning message
- Response: "Account created, but verification email failed to send. Please contact support."
- Logs error for investigation

## Testing

### 1. Start Services

```bash
# Terminal 1: FastAPI backend
cd ai-agent-service
python -m uvicorn app:app --reload --port 8000

# Terminal 2: Next.js frontend
npm run dev
```

### 2. Test Email Flow

1. Go to http://localhost:3000/auth/signup
2. Enter email, password, and name
3. Submit form
4. Check Resend logs in dashboard for sent email
5. Copy verification link from email
6. Paste in browser or click link
7. Should redirect to signin with success message
8. Sign in with verified account

### 3. Check MongoDB

```bash
# Open Mongo Express
http://localhost:8081

# Check users collection
# Find your user and verify:
# - emailVerified: true
# - verificationToken: null
# - verificationExpiry: null
```

## Customization

### Change Token Expiration

In `/app/api/auth/register/route.ts`:

```typescript
// Change from 24 hours to 48 hours
const verificationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)
```

### Customize Email Template

Edit the HTML in `/app/api/auth/register/route.ts`:

```typescript
await resend.emails.send({
  // ... other fields
  html: `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML template -->
    </html>
  `
})
```

### Add Resend Email Later

You can also resend verification emails by creating a new endpoint:

```typescript
// app/api/auth/resend-verification/route.ts
export async function POST(req: Request) {
  const { email } = await req.json()
  
  // Find user
  const user = await users_collection.find_one({ email })
  
  // Generate new token
  // Send new email
  // Update user document
}
```

## Troubleshooting

### Email Not Sending

1. Check Resend API key is correct in `.env.local`
2. Check Resend dashboard for error logs
3. Verify you haven't exceeded rate limits (100/day for free tier)
4. Check FastAPI logs for errors

### Token Not Working

1. Check token hasn't expired (24h limit)
2. Verify token in MongoDB matches URL parameter
3. Check for trailing spaces or encoding issues

### Already Verified

If user is already verified, the endpoint returns:
```json
{
  "success": true,
  "message": "Email already verified"
}
```

## Production Checklist

- [ ] Add `RESEND_API_KEY` to production environment variables
- [ ] Verify custom domain with Resend
- [ ] Update `from` email address in code
- [ ] Test email delivery to multiple providers (Gmail, Outlook, etc.)
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting for signup endpoint
- [ ] Add captcha to prevent spam signups
- [ ] Set up alerts for email send failures
- [ ] Review email template on mobile devices
- [ ] Add unsubscribe link (required by anti-spam laws)

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
- [Domain Verification](https://resend.com/docs/knowledge-base/verify-domain)

## Support

For issues with:
- **Resend API**: Check [Resend Support](https://resend.com/support)
- **Implementation**: Review FastAPI logs and Next.js console
- **Email Delivery**: Check spam folders and email provider settings
