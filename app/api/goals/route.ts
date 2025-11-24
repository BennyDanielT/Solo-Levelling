import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z, ZodError } from 'zod'

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  weight: z.number().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  points: z.number().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: goals
    })

  } catch (error) {
    console.error('Get goals error:', error)
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = goalSchema.parse(body)

    const goal = await prisma.goal.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        weight: validatedData.weight,
        difficulty: validatedData.difficulty || 'medium',
        points: validatedData.points || validatedData.weight * 2,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    }, { status: 201 })

  } catch (error: any) {
      if (error instanceof ZodError) {
        const flattened = error.flatten();
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            issues: error.issues,
            fieldErrors: flattened.fieldErrors,
          },
          { status: 400 }
        );
      }
  
      console.error('Create goal error', error);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}