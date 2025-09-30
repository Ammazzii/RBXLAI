'use client'

import { useRouter } from 'next/navigation'

export default function BillingCancelPage() {
  const router = useRouter()

  const handleReturnHome = () => {
    router.push('/')
  }

  const handleTryAgain = () => {
    router.push('/')
    // The user can click upgrade again from the main page
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-yellow-500 text-5xl mb-4">⏸️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h1>
          <p className="text-gray-400 mb-6">
            No worries! You can upgrade your plan anytime to get more daily prompts and premium features.
          </p>

          <div className="bg-gray-750 border border-gray-600 rounded p-4 mb-6">
            <h3 className="font-medium text-white mb-2">Your Current Plan</h3>
            <p className="text-sm text-gray-400">
              You&apos;re still on the <strong>Free Plan</strong> with 10 daily prompts.
              <br />
              You can continue using RBXAI with your current limits.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
            >
              Try Upgrading Again
            </button>
            <button
              onClick={handleReturnHome}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}