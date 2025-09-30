import { prisma } from './prisma'
import { ApiCallType, SubscriptionTier } from '@prisma/client'

export interface UsageTrackingParams {
  userId: string
  apiCallType: ApiCallType
  tokensUsed?: number
  requestDetails?: Record<string, string | number | boolean | null>
  responseTime?: number
}

function getDailyPromptLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE':
      return parseInt(process.env.FREE_TIER_DAILY_PROMPTS || '10')
    case 'STARTER':
      return parseInt(process.env.STARTER_TIER_DAILY_PROMPTS || '100')
    case 'PROFESSIONAL':
      return parseInt(process.env.PROFESSIONAL_TIER_DAILY_PROMPTS || '500')
    case 'ENTERPRISE':
      return parseInt(process.env.ENTERPRISE_TIER_DAILY_PROMPTS || '2000')
    default:
      return 10
  }
}

function isNewDay(lastResetDate: Date): boolean {
  const today = new Date()
  const lastReset = new Date(lastResetDate)
  return today.toDateString() !== lastReset.toDateString()
}

export async function checkAndConsumePrompt(userId: string, userTier: SubscriptionTier): Promise<{ success: boolean; error?: string; remainingPrompts?: number }> {
  try {
    const dailyLimit = getDailyPromptLimit(userTier)

    // Get user's current usage
    let userCredits = await prisma.credit.findUnique({
      where: { userId }
    })

    if (!userCredits) {
      // Create credits record if it doesn't exist
      userCredits = await prisma.credit.create({
        data: {
          userId,
          promptsUsedToday: 0,
          lastResetDate: new Date(),
          totalPromptsUsed: 0
        }
      })
    }

    // Check if we need to reset daily counter
    if (isNewDay(userCredits.lastResetDate)) {
      userCredits = await prisma.credit.update({
        where: { userId },
        data: {
          promptsUsedToday: 0,
          lastResetDate: new Date()
        }
      })
    }

    // Check if user has remaining prompts
    if (userCredits.promptsUsedToday >= dailyLimit) {
      return {
        success: false,
        error: 'Daily prompt limit exceeded',
        remainingPrompts: 0
      }
    }

    // Consume one prompt
    const updatedCredits = await prisma.credit.update({
      where: { userId },
      data: {
        promptsUsedToday: { increment: 1 },
        totalPromptsUsed: { increment: 1 }
      }
    })

    return {
      success: true,
      remainingPrompts: dailyLimit - updatedCredits.promptsUsedToday
    }

  } catch (error) {
    console.error('Prompt consumption error:', error)
    return { success: false, error: 'Failed to consume prompt' }
  }
}

export async function trackUsageAndDeductCredits(params: UsageTrackingParams): Promise<{ success: boolean; error?: string }> {
  const { userId, apiCallType, tokensUsed, requestDetails, responseTime } = params

  try {
    // Log usage (1 prompt consumed)
    await prisma.usageLog.create({
      data: {
        userId,
        apiCallType,
        tokensUsed,
        promptsUsed: 1,
        requestDetails: requestDetails ? JSON.parse(JSON.stringify(requestDetails)) : null,
        responseTime
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Usage tracking error:', error)
    return { success: false, error: 'Failed to track usage' }
  }
}

export async function getUserPromptStats(userId: string): Promise<{ promptsUsedToday: number; totalPromptsUsed: number; dailyLimit: number; remainingPrompts: number } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { credits: true }
    })

    if (!user || !user.credits) return null

    const dailyLimit = getDailyPromptLimit(user.subscriptionTier)
    let promptsUsedToday = user.credits.promptsUsedToday

    // Reset if it's a new day
    if (isNewDay(user.credits.lastResetDate)) {
      await prisma.credit.update({
        where: { userId },
        data: {
          promptsUsedToday: 0,
          lastResetDate: new Date()
        }
      })
      promptsUsedToday = 0
    }

    return {
      promptsUsedToday,
      totalPromptsUsed: user.credits.totalPromptsUsed,
      dailyLimit,
      remainingPrompts: Math.max(0, dailyLimit - promptsUsedToday)
    }

  } catch (error) {
    console.error('Get prompt stats error:', error)
    return null
  }
}

export async function getUserUsageStats(userId: string, days: number = 30) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId,
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalPromptsUsed = usageLogs.reduce((sum, log) => sum + log.promptsUsed, 0)
    const totalTokensUsed = usageLogs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0)
    const totalRequests = usageLogs.length

    const usageByType = usageLogs.reduce((acc, log) => {
      acc[log.apiCallType] = (acc[log.apiCallType] || 0) + log.promptsUsed
      return acc
    }, {} as Record<string, number>)

    return {
      totalPromptsUsed,
      totalTokensUsed,
      totalRequests,
      usageByType,
      logs: usageLogs.slice(0, 50) // Return latest 50 logs
    }

  } catch (error) {
    console.error('Get usage stats error:', error)
    return null
  }
}