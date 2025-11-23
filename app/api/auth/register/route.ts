import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    const { name, username, email, password } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 400 }
      )
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      })

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            error: 'Username is already taken'
          },
          { status: 400 }
        )
      }
    }

    // Hash password
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(password, bcryptRounds)

    // Create user with Solo Leveling defaults
    const user = await prisma.user.create({
      data: {
        name,
        username: username || null,
        email,
        password: hashedPassword,
        loginPlatform: 'email',
        level: 1,
        totalPoints: 0,
        rank: 'E',
        title: 'Awakened Hunter',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        level: true,
        totalPoints: true,
        rank: true,
        title: true,
        loginPlatform: true,
        joinedAt: true,
        preferences: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: { user }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          data: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
} 