"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  role: 'patient' | 'physio' | 'admin'
  full_name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<{ confirmation_sent: boolean; email_confirmed: boolean }>
  logout: () => void
  isLoading: boolean
  resendConfirmation: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user_data')
        
        if (token && userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password })
      const userData = {
        id: response.user_id,
        email: response.email,
        role: response.role || 'patient',
        full_name: response.full_name || email.split('@')[0]
      }
      setUser(userData)
      localStorage.setItem('user_data', JSON.stringify(userData))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (userData: any) => {
    try {
      console.log('Attempting signup with:', userData)
      const response = await apiClient.signup(userData)
      console.log('Signup response:', response)
      
      // Return confirmation status instead of auto-login
      return {
        confirmation_sent: response.confirmation_sent,
        email_confirmed: response.email_confirmed
      }
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      await apiClient.resendConfirmation(email)
    } catch (error) {
      console.error('Resend confirmation failed:', error)
      throw error
    }
  }

  const logout = () => {
    try {
      apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user_data')
      localStorage.removeItem('access_token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}