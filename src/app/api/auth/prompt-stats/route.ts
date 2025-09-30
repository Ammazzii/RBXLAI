import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getUserPromptStats } from '@/lib/usage-tracking'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const promptStats = await getUserPromptStats(user.id)

    if (!promptStats) {
      return NextResponse.json(
        { error: 'Failed to get prompt stats' },
        { status: 500 }
      )
    }

    return NextResponse.json(promptStats)

  } catch (error) {
    console.error('Get prompt stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}