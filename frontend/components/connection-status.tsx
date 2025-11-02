"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      } catch {
        setIsConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30s
    
    return () => clearInterval(interval)
  }, [])

  if (isChecking) {
    return <Badge variant="outline">Checking...</Badge>
  }

  return (
    <Badge variant={isConnected ? "default" : "destructive"}>
      {isConnected ? "Backend Connected" : "Backend Offline"}
    </Badge>
  )
}
