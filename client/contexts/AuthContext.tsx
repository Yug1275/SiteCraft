"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  googleLogin: (data: { email: string; name: string; avatar_url?: string; token?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('sitecraft-token')
      if (!token) {
        setLoading(false)
        return
      }

      const data = await api.get<{ user: User }>('/auth/me')
      setUser(data.user)
    } catch (error) {
      localStorage.removeItem('sitecraft-token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('sitecraft-token', data.token)
    setUser(data.user)
    router.push('/')
  }

  const signup = async (name: string, email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/signup', {
      name,
      email,
      password,
    })
    localStorage.setItem('sitecraft-token', data.token)
    setUser(data.user)
    router.push('/')
  }

  const googleLogin = async (googleData: { email: string; name: string; avatar_url?: string; token?: string }) => {
    const data = await api.post<{ token: string; user: User }>('/auth/google', googleData)
    localStorage.setItem('sitecraft-token', data.token)
    setUser(data.user)
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('sitecraft-token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        googleLogin,
        logout,
      }}
    >
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
