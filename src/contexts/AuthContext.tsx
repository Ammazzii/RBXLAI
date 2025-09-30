'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
  promptStats: {
    promptsUsedToday: number
    dailyLimit: number
    remainingPrompts: number
  } | null
  updatePromptStats: (stats: { promptsUsedToday: number; dailyLimit: number; remainingPrompts: number }) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [promptStats, setPromptStats] = useState<{
    promptsUsedToday: number
    dailyLimit: number
    remainingPrompts: number
  } | null>(null)

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(tokenToVerify)

        // Get prompt stats
        await fetchPromptStats(tokenToVerify)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('rbxai-token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('rbxai-token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPromptStats = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/prompt-stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const stats = await response.json()
        setPromptStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch prompt stats:', error)
    }
  }

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('rbxai-token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [verifyToken])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('rbxai-token', authToken)
    fetchPromptStats(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setPromptStats(null)
    localStorage.removeItem('rbxai-token')
  }

  const updatePromptStats = (stats: { promptsUsedToday: number; dailyLimit: number; remainingPrompts: number }) => {
    setPromptStats(stats)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading,
      promptStats,
      updatePromptStats
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}