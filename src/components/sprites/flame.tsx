"use client"

import React from "react"

// Flame sprite based on ui-example.jpg
// Symmetric flame: cream core → yellow → orange → red tips
// Using half-width and mirroring for perfect symmetry

const PALETTE: Record<string, string> = {
  ".": "transparent",
  "R": "var(--red)",
  "O": "var(--orange)",
  "Y": "var(--yellow)",
  "C": "var(--cream)",
}

// Left half of flame (will be mirrored)
const FLAME_HALF_A = [
  "........R",
  ".......RR",
  "......RRR",
  ".....RRRR",
  "....RRRRR",
  "...RRRRRR",
  "..RRRRROR",
  "..RRRROOO",
  ".RRRROOO.",
  ".RRROOOOY",
  ".RROOOOYY",
  "RROOOYYY.",
  "RROOYYY..",
  "RROYYYYY.",
  "RROYYYYC.",
  "RROYYYCC.",
  "RROYYCC..",
  ".ROYCCC..",
  ".ROYCCC..",
  ".ROCCC...",
  "..ROCC...",
  "..ROC....",
  "...RO....",
  "...R.....",
]

// Frame B - slightly different tips for flicker
const FLAME_HALF_B = [
  ".......RR",
  "........R",
  "......RRR",
  ".....RRRR",
  "....RRRRR",
  "...RRRRR.",
  "..RRRRRRO",
  "..RRRROO.",
  ".RRRROOO.",
  ".RRROOOO.",
  ".RROOOOOY",
  "RROOOYYY.",
  "RROOYYYY.",
  "RROYYYYY.",
  "RROYYYYC.",
  "RROYYYCC.",
  "RROYYCC..",
  ".ROYCCC..",
  ".ROYCCC..",
  ".ROCCC...",
  "..ROCC...",
  "..ROC....",
  "...RO....",
  "...R.....",
]

interface FlameProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

function renderFlame(halfMap: string[], pixelSize: number) {
  const height = halfMap.length
  const halfWidth = halfMap[0]?.length || 0
  const fullWidth = halfWidth * 2

  const rects: React.ReactNode[] = []

  halfMap.forEach((row, y) => {
    const chars = row.split("")
    chars.forEach((char, x) => {
      if (char !== "." && PALETTE[char]) {
        // Left side
        rects.push(
          <rect
            key={`l-${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={PALETTE[char]}
          />
        )
        // Mirror to right side
        const mirrorX = fullWidth - 1 - x
        rects.push(
          <rect
            key={`r-${mirrorX}-${y}`}
            x={mirrorX * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={PALETTE[char]}
          />
        )
      }
    })
  })

  return (
    <svg
      width={fullWidth * pixelSize}
      height={height * pixelSize}
      viewBox={`0 0 ${fullWidth * pixelSize} ${height * pixelSize}`}
      style={{ shapeRendering: "crispEdges" }}
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

export function Flame({ size = "md", className }: FlameProps) {
  const pixelSizes = { sm: 4, md: 8, lg: 10 }
  const pixelSize = pixelSizes[size]

  return (
    <div className={`relative ${className || ""}`} aria-hidden="true">
      {/* Frame A */}
      <div className="animate-flicker">
        {renderFlame(FLAME_HALF_A, pixelSize)}
      </div>
      {/* Frame B - offset animation */}
      <div
        className="absolute inset-0 animate-flicker"
        style={{ animationDelay: "0.5s" }}
      >
        {renderFlame(FLAME_HALF_B, pixelSize)}
      </div>
    </div>
  )
}
