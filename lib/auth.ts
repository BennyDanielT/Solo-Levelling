import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Use Docker service name for server-side calls, localhost for client-side
const FASTAPI_URL = process.env.FASTAPI_SERVICE_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://fastapi:8000';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${FASTAPI_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          console.log('Login response:', data);

          if (!res.ok) {
            console.error('Login failed:', data);
            // Check if it's an email verification error (403 status)
            if (res.status === 403) {
              throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
            }
            return null;
          }
          
          if (data.access_token && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.username || data.user.email,
              accessToken: data.access_token,
            };
          }
          
          console.error('Invalid response structure:', data);
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, save user to MongoDB and get JWT token
      if (account?.provider === 'google' && user.email) {
        try {
          console.log('🔐 OAuth login - saving user and getting JWT token');
          const res = await fetch(`${FASTAPI_URL}/auth/oauth-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            }),
          });
          
          if (!res.ok) {
            console.error('Failed to save OAuth user to MongoDB');
            return false;
          }
          
          const data = await res.json();
          console.log('✅ OAuth login response:', data);
          
          // Store the JWT token in the user object so it can be added to the session
          if (data.access_token) {
            (user as any).accessToken = data.access_token;
            console.log('💾 Stored JWT token in user object');
          }
        } catch (error) {
          console.error('Error saving OAuth user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
        };
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
};