'use client'

import { useState } from 'react'
import { z } from 'zod'

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  subscriptionTier: string
  credits?: {
    promptsUsedToday: number
    totalPromptsUsed: number
  }
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User, token: string) => void
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form data
      const schema = mode === 'login' ? loginSchema : registerSchema
      const validatedData = schema.parse(formData)

      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token in localStorage
      localStorage.setItem('rbxai-token', data.token)

      // Call success callback
      onSuccess(data.user, data.token)
      onClose()

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' })
    setError('')
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    resetForm()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {mode === 'login' ? 'Login to RBXAI' : 'Create RBXAI Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/50 rounded p-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded text-white transition-colors"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={switchMode}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </div>

        {mode === 'register' && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            By creating an account, you start with 10 free prompts daily.
            <br />
            Upgrade anytime for more prompts and features.
          </div>
        )}
      </div>
    </div>
  )
}