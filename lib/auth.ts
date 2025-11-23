import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // Commented out to use JWT sessions
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last active
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          username: user.username,
          image: user.image || undefined,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        // Store platform info in JWT for future use
        if (account) {
          token.loginPlatform = account.provider
          token.platformId = account.providerAccountId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        // Add platform info to session for future use
        session.user.loginPlatform = token.loginPlatform as string
        session.user.platformId = token.platformId as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-ins - create/update user in database
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          if (!user.email) return false

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // Create new user with Solo Leveling defaults
            await prisma.user.create({
              data: {
                name: user.name || "Hunter",
                email: user.email,
                image: user.image,
                loginPlatform: account.provider,
                level: 1,
                totalPoints: 0,
                rank: "E",
                title: "Awakened Hunter",
                preferences: {
                  theme: "dark",
                  notifications: true,
                  language: "en"
                }
              }
            })
          } else {
            // Update existing user's last active time
            await prisma.user.update({
              where: { email: user.email },
              data: { 
                lastActive: new Date(),
                image: user.image // Update avatar in case it changed
              }
            })
          }

          console.log(`✅ ${account.provider} sign-in successful for:`, user.email)
          return true
        } catch (error) {
          console.error(`❌ Error during ${account.provider} sign-in:`, error)
          return false
        }
      }
      
      // For credentials provider, user is already validated in authorize
      if (account?.provider === "credentials") {
        return true
      }
      
      console.log(`❌ Sign-in rejected for provider:`, account?.provider)
      return false
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} 