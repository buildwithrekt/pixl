"use client"

import React, { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

const COLORS = ["bg-lime", "bg-lime/80", "bg-lime/60", "bg-lime/40"]
const GRID_SIZE = 32 // 32x8 = 256 cells for preview
const ROWS = 8

interface Cell {
  filled: boolean
  color: string
}

// Generate initial random cells
function generateCells(count: number): Cell[] {
  return Array.from({ length: count }, () => ({
    filled: Math.random() > 0.7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

// Empty cells for SSR
function emptyCell(): Cell {
  return { filled: false, color: "bg-gray-800" }
}

export function BoardPreview() {
  // Start with empty cells to avoid hydration mismatch
  const [cells, setCells] = useState<Cell[]>(() =>
    Array.from({ length: GRID_SIZE * ROWS }, emptyCell)
  )

  // Generate random cells only on client
  useEffect(() => {
    setCells(generateCells(GRID_SIZE * ROWS))
  }, [])

  const handleHover = useCallback((index: number) => {
    setCells((prev) =>
      prev.map((cell, i) =>
        i === index ? { ...cell, filled: true, color: "bg-lime" } : cell
      )
    )
  }, [])

  return (
    <div className="bg-gray-900 border-t border-gray-700 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hint text */}
        <p className="font-mono text-[10px] text-center text-gray-500 mb-4 uppercase tracking-wider">
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
                  : "bg-gray-800 border border-gray-700"
              )}
              onMouseEnter={() => handleHover(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
