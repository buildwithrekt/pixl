"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const GRID_SIZE = 128 // 128×128 cells
const CELL_SIZE = 6   // pixels per cell in display

interface Selection {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface Zone {
  x: number
  y: number
  w: number
  h: number
  status: "reserved" | "paid" | "drawn"
  color?: string
}

interface BoardCanvasProps {
  zones?: Zone[]
  onSelectionComplete?: (selection: { x: number; y: number; w: number; h: number }) => void
  disabled?: boolean
}

export function BoardCanvas({
  zones = [],
  onSelectionComplete,
  disabled = false,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)

  // Create occupancy map
  const occupancy = useCallback(() => {
    const map = new Set<string>()
    zones.forEach((zone) => {
      for (let x = zone.x; x < zone.x + zone.w; x++) {
        for (let y = zone.y; y < zone.y + zone.h; y++) {
          map.add(`${x},${y}`)
        }
      }
    })
    return map
  }, [zones])

  // Get cell from mouse/touch position
  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return null

      let clientX: number, clientY: number
      if ("touches" in e) {
        if (e.touches.length === 0) return null
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const x = Math.floor((clientX - rect.left) / CELL_SIZE)
      const y = Math.floor((clientY - rect.top) / CELL_SIZE)
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null
      return { x, y }
    },
    []
  )

  // Check if selection overlaps with existing zones
  const isSelectionValid = useCallback(
    (sel: Selection) => {
      const occMap = occupancy()
      const minX = Math.min(sel.startX, sel.endX)
      const maxX = Math.max(sel.startX, sel.endX)
      const minY = Math.min(sel.startY, sel.endY)
      const maxY = Math.max(sel.startY, sel.endY)

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          if (occMap.has(`${x},${y}`)) return false
        }
      }
      return true
    },
    [occupancy]
  )

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const occMap = occupancy()

    // Clear
    ctx.fillStyle = "#FAF5EA" // paper
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#E9E1CF" // grid-line
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw occupied cells
    const colors: Record<string, string> = {
      reserved: "#FFC800", // yellow
      paid: "#FF8A00",     // orange
      drawn: "#E8402A",    // red
    }

    zones.forEach((zone) => {
      ctx.fillStyle = zone.color || colors[zone.status] || "#2A5BFF"
      ctx.fillRect(
        zone.x * CELL_SIZE,
        zone.y * CELL_SIZE,
        zone.w * CELL_SIZE,
        zone.h * CELL_SIZE
      )
    })

    // Draw hover cell
    if (hoverCell && !isSelecting && !occMap.has(`${hoverCell.x},${hoverCell.y}`)) {
      ctx.fillStyle = "rgba(42, 91, 255, 0.3)" // blue with opacity
      ctx.fillRect(
        hoverCell.x * CELL_SIZE,
        hoverCell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      )
    }

    // Draw selection
    if (selection) {
      const minX = Math.min(selection.startX, selection.endX)
      const maxX = Math.max(selection.startX, selection.endX)
      const minY = Math.min(selection.startY, selection.endY)
      const maxY = Math.max(selection.startY, selection.endY)
      const w = maxX - minX + 1
      const h = maxY - minY + 1

      const valid = isSelectionValid(selection)

      ctx.fillStyle = valid
        ? "rgba(42, 91, 255, 0.4)"  // blue
        : "rgba(232, 64, 42, 0.4)" // red (invalid)
      ctx.fillRect(
        minX * CELL_SIZE,
        minY * CELL_SIZE,
        w * CELL_SIZE,
        h * CELL_SIZE
      )

      ctx.strokeStyle = valid ? "#2A5BFF" : "#E8402A"
      ctx.lineWidth = 2
      ctx.strokeRect(
        minX * CELL_SIZE,
        minY * CELL_SIZE,
        w * CELL_SIZE,
        h * CELL_SIZE
      )
    }
  }, [zones, hoverCell, selection, isSelectionValid, occupancy])

  // Redraw on changes
  useEffect(() => {
    draw()
  }, [draw])

  // Mouse/Touch handlers
  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (disabled) return
      const cell = getCellFromEvent(e)
      if (!cell) return
      if (occupancy().has(`${cell.x},${cell.y}`)) return

      setIsSelecting(true)
      setSelection({
        startX: cell.x,
        startY: cell.y,
        endX: cell.x,
        endY: cell.y,
      })
    },
    [disabled, getCellFromEvent, occupancy]
  )

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e)
      if (!cell) {
        setHoverCell(null)
        return
      }

      setHoverCell(cell)

      if (isSelecting && selection) {
        setSelection((prev) =>
          prev ? { ...prev, endX: cell.x, endY: cell.y } : null
        )
      }
    },
    [getCellFromEvent, isSelecting, selection]
  )

  const handlePointerUp = useCallback(() => {
    if (isSelecting && selection && isSelectionValid(selection)) {
      const minX = Math.min(selection.startX, selection.endX)
      const maxX = Math.max(selection.startX, selection.endX)
      const minY = Math.min(selection.startY, selection.endY)
      const maxY = Math.max(selection.startY, selection.endY)

      onSelectionComplete?.({
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1,
      })
    }

    setIsSelecting(false)
    setSelection(null)
  }, [isSelecting, selection, isSelectionValid, onSelectionComplete])

  const handlePointerLeave = useCallback(() => {
    setHoverCell(null)
    if (isSelecting) {
      setIsSelecting(false)
      setSelection(null)
    }
  }, [isSelecting])

  // Prevent scroll while drawing on touch
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!disabled) {
        e.preventDefault()
      }
      handlePointerDown(e)
    },
    [disabled, handlePointerDown]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (isSelecting) {
        e.preventDefault()
      }
      handlePointerMove(e)
    },
    [isSelecting, handlePointerMove]
  )

  return (
    <div className="overflow-auto border-2 border-ink rounded-[14px] shadow-hard-lg bg-white p-2 touch-none">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className={cn(
          "cursor-crosshair touch-none",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  )
}
