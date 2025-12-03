# Quick Start: Email Verification Setup

## 1. Get Resend API Key (5 minutes)

1. Go to https://resend.com
2. Sign up for free account
3. Navigate to https://resend.com/api-keys
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

## 2. Add to Environment Variables

Add to your `.env.local` file:

```bash
RESEND_API_KEY=re_your_actual_key_here
```

## 3. Test the Flow

### Start Services
```bash
# Terminal 1: Start FastAPI
cd ai-agent-service
python -m uvicorn app:app --reload --port 8000

# Terminal 2: Start Next.js
npm run dev
```

### Test Signup
1. Go to http://localhost:3000/auth/signup
2. Fill in email, password, name
3. Click "Create Account"
4. You should see "Check Your Email" screen
5. Check your email inbox for verification link
6. Click the verification link
7. Should redirect to signin with success message

### Verify in MongoDB
1. Open http://localhost:8081 (Mongo Express)
2. Navigate to `solo_leveling` → `users` collection
3. Find your user
4. Check fields:
   - `emailVerified: true` ✅
   - `verificationToken: null`
   - `verificationExpiry: null`

## 4. Production Setup (When Ready)

### Verify Your Domain
1. Go to https://resend.com/domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records to your domain provider:
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM records (provided by Resend)
4. Wait for verification

### Update Email Address
In `/app/api/auth/register/route.ts`, line 57:

```typescript
from: 'Life Hacker <onboarding@yourdomain.com>', // Change this
```

## What's Already Done ✅

- ✅ Signup page rebranded (emerald/cyan theme)
- ✅ Signin page updated to match
- ✅ Email verification backend (`/api/auth/register`, `/api/auth/verify-email`)
- ✅ FastAPI endpoints updated (`/auth/register`, `/auth/verify-email`)
- ✅ MongoDB schema includes verification fields
- ✅ Email template designed with emerald/cyan branding
- ✅ Success/error message handling on signin page
- ✅ OAuth users auto-verified
- ✅ Token expiration (24 hours)
- ✅ Resend package installed

## What You Need to Do 🔧

1. **Get Resend API key** (see step 1 above)
2. **Add to `.env.local`** (see step 2 above)
3. **Test the flow** (see step 3 above)
4. **Add video background** (optional):
   - Upload video to `/public/videos/background.mp4`
   - Update `/app/auth/signup/page.tsx` line ~73
   - Update `/app/auth/signin/page.tsx` line ~77

## Video Background Setup (Optional)

### Add Video Element

Replace the background div in both signup and signin pages:

```tsx
// Current placeholder:
<div className='absolute inset-0 w-full h-full'>
  <div className='absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-cyan-900/80 to-blue-900/80 z-10'></div>
  <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900/30 to-cyan-900/30'></div>
</div>

// With video:
<div className='absolute inset-0 w-full h-full'>
  <video
    autoPlay
    loop
    muted
    playsInline
    className='absolute inset-0 w-full h-full object-cover'
  >
    <source src='/videos/background.mp4' type='video/mp4' />
  </video>
  <div className='absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-cyan-900/80 to-blue-900/80 z-10'></div>
</div>
```

## Troubleshooting

### Email Not Sending
- Check `RESEND_API_KEY` in `.env.local`
- Check Resend dashboard for errors: https://resend.com/emails
- Verify you haven't hit rate limit (100/day free tier)

### Verification Link Not Working
- Check token hasn't expired (24 hours)
- Look for errors in FastAPI logs
- Verify MongoDB user has `verificationToken` field

### Already Verified Error
- This is normal if user already verified
- User can proceed to sign in

## Rate Limits (Free Tier)

- **Daily**: 100 emails
- **Monthly**: 3,000 emails
- **Upgrade**: https://resend.com/pricing

## Need Help?

- **Email Verification Guide**: See `EMAIL_VERIFICATION_SETUP.md`
- **Rebrand Details**: See `REBRAND_SUMMARY.md`
- **Resend Docs**: https://resend.com/docs
- **Resend Support**: https://resend.com/support
