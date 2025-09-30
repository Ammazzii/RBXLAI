'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function BillingSuccessContent() {
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    // Verify the payment was successful
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/billing/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error('Failed to verify payment')
        }

        const data = await response.json()
        console.log('Payment verified:', data)
      } catch (err) {
        console.error('Payment verification failed:', err)
        setError('Failed to verify payment')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      verifyPayment()
    }
  }, [sessionId, token])

  const handleReturnHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleReturnHome}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for upgrading your RBXAI account! Your new plan is now active and you have access to increased daily prompts.
          </p>
          <div className="bg-gray-750 border border-gray-600 rounded p-4 mb-6">
            <h3 className="font-medium text-white mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-gray-400 text-left space-y-1">
              <li>• Your daily prompt limit has been increased</li>
              <li>• Your prompt counter has been reset for today</li>
              <li>• You now have access to priority support</li>
              <li>• All premium features are now available</li>
            </ul>
          </div>
          <button
            onClick={handleReturnHome}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  )
}