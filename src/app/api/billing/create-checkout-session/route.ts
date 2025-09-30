import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromRequest } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    priceId: 'price_1QmBjFDEkYoRExpkSvtYZLcF', // Replace with actual Stripe price ID
    subscriptionTier: 'STARTER'
  },
  professional: {
    name: 'Professional',
    priceId: 'price_1QmBjGDEkYoRExpkHK8xVJQM', // Replace with actual Stripe price ID
    subscriptionTier: 'PROFESSIONAL'
  },
  enterprise: {
    name: 'Enterprise',
    priceId: 'price_1QmBjHDEkYoRExpkLmNkQP2V', // Replace with actual Stripe price ID
    subscriptionTier: 'ENTERPRISE'
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { priceId, planName } = await req.json()

    if (!priceId || !planName) {
      return NextResponse.json({ error: 'Price ID and plan name are required' }, { status: 400 })
    }

    // Find the plan details
    const plan = Object.values(PRICING_PLANS).find(p => p.name === planName)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Prevent users from downgrading through this endpoint
    if (user.subscriptionTier !== 'FREE') {
      return NextResponse.json({
        error: 'Please contact support to change your existing subscription'
      }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing/cancel`,
      metadata: {
        userId: user.id,
        planName: plan.name,
        subscriptionTier: plan.subscriptionTier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planName: plan.name,
          subscriptionTier: plan.subscriptionTier,
        },
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session')
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: `Payment system error: ${error.message}`
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create checkout session'
    }, { status: 500 })
  }
}