import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Simple admin check - only allow specific email(s) or make it configurable
    if (user.email !== 'admin@rbxai.dev' && user.email !== 'test@example.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get user analytics
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { isActive: true } })

    const usersByTier = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true
    })

    const totalTransactions = await prisma.transaction.count()
    const successfulTransactions = await prisma.transaction.count({
      where: { status: TransactionStatus.COMPLETED }
    })

    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        status: TransactionStatus.COMPLETED
      },
      _sum: { amount: true }
    })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayUsage = await prisma.usageLog.count({
      where: {
        createdAt: { gte: todayStart }
      }
    })

    const todayNewUsers = await prisma.user.count({
      where: {
        createdAt: { gte: todayStart }
      }
    })

    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        createdAt: true,
        lastLoginAt: true,
        credits: {
          select: {
            promptsUsedToday: true,
            totalPromptsUsed: true
          }
        }
      }
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalTransactions,
        successfulTransactions,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayUsage,
        todayNewUsers
      },
      usersByTier: usersByTier.map(tier => ({
        tier: tier.subscriptionTier,
        count: tier._count
      })),
      recentUsers
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics'
    }, { status: 500 })
  }
}