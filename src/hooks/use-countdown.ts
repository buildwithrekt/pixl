"use client"

import { useState, useEffect, useCallback } from "react"

interface CountdownState {
  remaining: number // seconds remaining
  minutes: number
  seconds: number
  isExpired: boolean
  isUrgent: boolean // < 2 minutes
}

export function useCountdown(expiresAt: Date | string | null): CountdownState {
  const [state, setState] = useState<CountdownState>({
    remaining: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false,
  })

  const calculateRemaining = useCallback(() => {
    if (!expiresAt) {
      return { remaining: 0, isExpired: true }
    }

    const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt
    const now = Date.now()
    const diff = expiry.getTime() - now
    const remaining = Math.max(0, Math.floor(diff / 1000))

    return {
      remaining,
      isExpired: remaining <= 0,
    }
  }, [expiresAt])

  useEffect(() => {
    if (!expiresAt) {
      setState({
        remaining: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        isUrgent: false,
      })
      return
    }

    const update = () => {
      const { remaining, isExpired } = calculateRemaining()
      setState({
        remaining,
        minutes: Math.floor(remaining / 60),
        seconds: remaining % 60,
        isExpired,
        isUrgent: remaining > 0 && remaining < 120, // < 2 minutes
      })
    }

    // Initial update
    update()

    // Update every second
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, calculateRemaining])

  return state
}

// Format countdown as MM:SS
export function formatCountdown(minutes: number, seconds: number): string {
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}
