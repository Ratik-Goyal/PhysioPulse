"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface EmailConfirmationProps {
  email: string
}

export function EmailConfirmation({ email }: EmailConfirmationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { resendConfirmation } = useAuth()

  const handleResend = async () => {
    setIsResending(true)
    setResendMessage('')
    
    try {
      await resendConfirmation(email)
      setResendMessage('Confirmation email sent successfully!')
    } catch (error: any) {
      setResendMessage('Failed to resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="container mx-auto px-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="text-2xl font-bold text-primary">Physio</div>
              <div className="text-2xl font-bold text-accent">Pulse</div>
            </Link>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Mail className="h-16 w-16 mx-auto text-primary" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Confirmation Email Sent</h3>
              <p className="text-muted-foreground">
                We've sent a confirmation email to:
              </p>
              <p className="font-medium text-primary">{email}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Please check your email and click the confirmation link to activate your account.
                Don't forget to check your spam folder!
              </p>
            </div>

            {resendMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                resendMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {resendMessage}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleResend} 
                disabled={isResending}
                variant="outline" 
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/patient/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}