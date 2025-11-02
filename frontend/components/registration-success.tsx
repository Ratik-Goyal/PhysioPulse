"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

interface RegistrationSuccessProps {
  email: string
  onContinue: () => void
}

export function RegistrationSuccess({ email, onContinue }: RegistrationSuccessProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-6 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
            <p className="text-muted-foreground">
              Your account has been created successfully
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You can now access your patient portal
              </p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={onContinue} className="w-full">
                Continue to Health Assessment
              </Button>
              
              <Link href="/patient/login" className="block">
                <Button variant="outline" className="w-full">
                  Go to Login Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}