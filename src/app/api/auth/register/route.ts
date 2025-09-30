import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateEmailVerifyToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    const emailVerifyToken = generateEmailVerifyToken()

    // Create user with credits
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        emailVerifyToken,
        credits: {
          create: {
            promptsUsedToday: 0,
            lastResetDate: new Date(),
            totalPromptsUsed: 0
          }
        }
      },
      include: {
        credits: true
      }
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    })

    // TODO: Send email verification email
    // await sendVerificationEmail(user.email, emailVerifyToken)

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        subscriptionTier: user.subscriptionTier,
        credits: user.credits
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}