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

    const { action } = await req.json()

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    switch (action) {
      case 'create_portal_session': {
        // Create a Stripe customer portal session for managing subscriptions
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${process.env.NEXTAUTH_URL}/`,
        })

        return NextResponse.json({
          url: portalSession.url
        })
      }

      case 'cancel_subscription': {
        if (!user.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
        }

        // Cancel the subscription at the end of the current period
        const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true
        })

        return NextResponse.json({
          success: true,
          message: 'Subscription will be canceled at the end of the current billing period',
          cancelAt: subscription.cancel_at
        })
      }

      case 'reactivate_subscription': {
        if (!user.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No subscription to reactivate' }, { status: 400 })
        }

        // Reactivate the subscription
        const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: false
        })

        return NextResponse.json({
          success: true,
          message: 'Subscription has been reactivated',
          subscription: {
            id: subscription.id,
            status: subscription.status
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error managing subscription:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: `Subscription management error: ${error.message}`
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to manage subscription'
    }, { status: 500 })
  }
}