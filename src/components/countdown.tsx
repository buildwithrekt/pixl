"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: Date): TimeLeft | null {
  const difference = targetDate.getTime() - new Date().getTime()

  if (difference <= 0) {
    return null
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-lime/30 rounded-lg px-4 py-3 min-w-[70px] md:min-w-[90px]"
      >
        <span className="font-mono text-3xl md:text-5xl text-lime tabular-nums">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mt-2">
        {label}
      </span>
    </div>
  )
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(targetDate))

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate)
      setTimeLeft(newTimeLeft)

      if (!newTimeLeft && onComplete) {
        onComplete()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <TimeBlock key={label} value={0} label={label} />
        ))}
      </div>
    )
  }

  if (!timeLeft) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sprite map={SPRITE_MAPS.fire} pixelSize={6} />
          <span className="font-display text-3xl md:text-4xl text-lime">LIVE NOW</span>
          <Sprite map={SPRITE_MAPS.fire} pixelSize={6} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="font-mono text-2xl text-lime/50 mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="font-mono text-2xl text-lime/50 mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="font-mono text-2xl text-lime/50 mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  )
}

export function CountdownBanner() {
  return (
    <div className="bg-black border-b border-lime/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            $BLOKR Token Launch
          </span>
          <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
        </div>

        <h2 className="font-display text-2xl md:text-3xl text-white mb-6">
          Pixel purchases available soon
        </h2>

        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Get your $BLOKR tokens ready. The board opens soon.
        </p>
      </div>
    </div>
  )
}
