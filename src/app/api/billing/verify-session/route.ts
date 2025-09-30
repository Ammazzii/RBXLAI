import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromRequest } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify the session belongs to the current user
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to user' }, { status: 403 })
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Payment not completed',
        status: session.payment_status
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        planName: session.metadata?.planName,
        subscriptionTier: session.metadata?.subscriptionTier
      }
    })

  } catch (error) {
    console.error('Error verifying session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: `Payment verification error: ${error.message}`
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to verify session'
    }, { status: 500 })
  }
}