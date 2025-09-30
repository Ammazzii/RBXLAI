'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PricingPlan {
  id: string
  name: string
  price: number
  dailyPrompts: number
  features: string[]
  priceId: string
  popular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    dailyPrompts: 100,
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: [
      '100 daily AI prompts',
      'Advanced code generation',
      'Project export/import',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 24.99,
    dailyPrompts: 500,
    priceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    popular: true,
    features: [
      '500 daily AI prompts',
      'Priority AI responses',
      'Advanced debugging tools',
      'Custom script templates',
      'Priority email support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    dailyPrompts: 2000,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      '2000 daily AI prompts',
      'Fastest AI responses',
      'Team collaboration',
      'Custom integrations',
      'Phone support',
      'Dedicated account manager'
    ]
  }
]

export default function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) return

    setLoading(plan.id)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rbxai-token')}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to start upgrade process')
    } finally {
      setLoading(null)
    }
  }

  const getCurrentPlanName = () => {
    switch (user?.subscriptionTier) {
      case 'STARTER': return 'Starter'
      case 'PROFESSIONAL': return 'Professional'
      case 'ENTERPRISE': return 'Enterprise'
      default: return 'Free'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
            <p className="text-gray-400 mt-1">
              Current plan: <span className="font-medium">{getCurrentPlanName()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => {
              const isCurrentPlan =
                (user?.subscriptionTier === 'STARTER' && plan.id === 'starter') ||
                (user?.subscriptionTier === 'PROFESSIONAL' && plan.id === 'professional') ||
                (user?.subscriptionTier === 'ENTERPRISE' && plan.id === 'enterprise')

              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-lg border-2 ${
                    plan.popular
                      ? 'border-blue-500 bg-gray-700'
                      : isCurrentPlan
                      ? 'border-green-500 bg-gray-750'
                      : 'border-gray-600 bg-gray-750'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    <p className="text-lg text-blue-400 font-medium">
                      {plan.dailyPrompts} daily prompts
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || loading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {loading === plan.id ? (
                      'Processing...'
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Free Plan Information */}
          <div className="mt-8 p-4 bg-gray-750 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Free Plan</h4>
                <p className="text-gray-400 text-sm">10 daily prompts • Basic features</p>
              </div>
              {user?.subscriptionTier === 'FREE' && (
                <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-600 bg-gray-750 rounded-b-lg">
          <p className="text-xs text-gray-400 text-center">
            All plans include secure payment processing via Stripe. You can cancel anytime.
            <br />
            Need help choosing? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}