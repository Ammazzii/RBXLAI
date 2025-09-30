import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier, TransactionStatus } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.userId
          const subscriptionTier = session.metadata?.subscriptionTier

          if (!userId || !subscriptionTier) {
            console.error('Missing metadata in checkout session:', session.id)
            break
          }

          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          // Update user subscription tier and reset daily prompt usage
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: subscriptionTier as SubscriptionTier,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
            }
          })

          // Reset daily prompt usage since they upgraded
          await prisma.credit.update({
            where: { userId },
            data: {
              promptsUsedToday: 0,
              lastResetDate: new Date(),
            }
          })

          // Log the transaction
          await prisma.transaction.create({
            data: {
              userId,
              amount: (session.amount_total || 0) / 100, // Convert from cents
              stripePaymentId: session.payment_intent as string,
              status: TransactionStatus.COMPLETED,
              subscriptionTier: subscriptionTier as SubscriptionTier,
              paymentMethod: 'stripe'
            }
          })

          console.log(`Successfully upgraded user ${userId} to ${subscriptionTier}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.userId
        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // Handle subscription status changes
        let subscriptionTier = subscription.metadata?.subscriptionTier || 'FREE'

        // If subscription is canceled, downgrade to FREE
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          subscriptionTier = 'FREE'
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: subscriptionTier as SubscriptionTier,
            stripeSubscriptionStatus: subscription.status,
          }
        })

        console.log(`Updated subscription status for user ${userId}: ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.userId
        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // Downgrade user to FREE tier
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'FREE',
            stripeSubscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
          }
        })

        console.log(`Downgraded user ${userId} to FREE tier due to subscription cancellation`)
        break
      }

      case 'invoice.payment_failed': {
        console.log(`Invoice payment failed for invoice: ${event.data.object.id}`)
        // Could log failed payment if needed, but skip for now due to API complexity
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}