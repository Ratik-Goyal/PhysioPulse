"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

export default function ConfirmEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type') || 'signup'

        if (!tokenHash) {
          setStatus('error')
          setMessage('Invalid confirmation link')
          return
        }

        const response = await apiClient.confirmEmail(tokenHash, type)
        
        if (response.confirmed && response.access_token) {
          apiClient.setToken(response.access_token)
          
          setStatus('success')
          setMessage('Email confirmed successfully! Redirecting to dashboard...')
          
          setTimeout(() => {
            router.push('/patient/health-questionnaire')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Email confirmation failed')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Email confirmation failed')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="container mx-auto px-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="text-2xl font-bold text-primary">Physio</div>
              <div className="text-2xl font-bold text-accent">Pulse</div>
            </Link>
            <CardTitle className="text-2xl">Email Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Confirming your email...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Success!</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Confirmation Failed</h3>
                  <p className="text-muted-foreground mb-4">{message}</p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/patient/register">Try Registration Again</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/patient/login">Go to Login</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}