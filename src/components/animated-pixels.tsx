"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const COLORS = ["bg-red", "bg-blue", "bg-yellow", "bg-orange"]
const COLUMNS = 48

interface AnimatedPixelsProps {
  className?: string
  rows?: number
}

export function AnimatedPixels({ className, rows = 3 }: AnimatedPixelsProps) {
  const [tick, setTick] = useState(0)

  // Stepped animation - update every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("w-full overflow-hidden py-4", className)}>
      <div
        className="grid gap-[3px] max-w-6xl mx-auto px-4"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
        }}
      >
        {Array.from({ length: COLUMNS * rows }).map((_, i) => {
          const col = i % COLUMNS
          const row = Math.floor(i / COLUMNS)

          // Wave pattern: color shifts based on column + tick
          const colorIndex = (col + tick + row) % COLORS.length

          // Some squares are "off" based on pattern
          const isVisible =
            (col + row + tick) % 5 !== 0 && // gaps
            Math.sin((col + tick * 0.5) * 0.3) > -0.5 // wave pattern

          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-[2px] transition-none",
                isVisible ? COLORS[colorIndex] : "bg-transparent"
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
