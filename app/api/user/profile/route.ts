import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated'
        },
        { status: 401 }
      )
    }

    // Get user with stats
    const userWithStats = await prisma.user.findUnique({
      where: { email: session.user.email },
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
        lastActive: true,
        preferences: true,
        _count: {
          select: {
            goals: true,
            achievements: true
          }
        }
      }
    })

    if (!userWithStats) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    // Update last active
    await prisma.user.update({
      where: { email: session.user.email },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: userWithStats
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
} 