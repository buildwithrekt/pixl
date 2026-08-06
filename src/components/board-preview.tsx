"use client"

import React, { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"

const COLORS = ["bg-red", "bg-blue", "bg-yellow", "bg-orange", "bg-ink"]
const GRID_SIZE = 32 // 32x8 = 256 cells for preview
const ROWS = 8

// Generate initial random cells
function generateCells(count: number) {
  return Array.from({ length: count }, () => ({
    filled: Math.random() > 0.7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

export function BoardPreview() {
  const initialCells = useMemo(() => generateCells(GRID_SIZE * ROWS), [])
  const [cells, setCells] = useState(initialCells)

  const handleHover = useCallback((index: number) => {
    setCells((prev) =>
      prev.map((cell, i) =>
        i === index ? { ...cell, filled: true, color: "bg-red" } : cell
      )
    )
  }, [])

  return (
    <div className="bg-white border-t-[2.5px] border-ink py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hint text */}
        <p className="font-pixel text-[10px] text-center text-ink/60 mb-4 uppercase tracking-wider">
          Hover to paint — Buy to keep
        </p>

        {/* Grid */}
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-[2px] cursor-crosshair transition-colors duration-0",
                cell.filled
                  ? cell.color
                  : "bg-paper border border-grid-line"
              )}
              onMouseEnter={() => handleHover(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
