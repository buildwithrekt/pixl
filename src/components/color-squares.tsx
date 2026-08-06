"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

const COLORS = [
  "bg-red",
  "bg-blue",
  "bg-yellow",
  "bg-orange",
  "bg-ink",
]

interface ColorSquaresProps {
  className?: string
  rows?: number
}

export function ColorSquares({ className, rows = 2 }: ColorSquaresProps) {
  // Generate random pattern for squares
  const squares = useMemo(() => {
    const total = 64 * rows // 64 columns per row
    return Array.from({ length: total }, (_, i) => ({
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: (i % 8) * 0.1, // stagger animation
      filled: Math.random() > 0.3, // 70% filled
    }))
  }, [rows])

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: "repeat(64, 1fr)",
        }}
      >
        {squares.map((square, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square",
              square.filled ? square.color : "bg-paper",
              square.filled && "animate-pulse-color"
            )}
            style={{
              animationDelay: `${square.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
