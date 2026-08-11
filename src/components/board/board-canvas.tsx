"use client"

import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { cn } from "@/lib/utils"

const GRID_SIZE = 128 // 128×128 cells
const DEFAULT_CELL_SIZE = 6 // pixels per cell in display (desktop)
const MIN_ZOOM = 0.5
const MAX_ZOOM = 8
const ZOOM_STEP = 0.15

interface Selection {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface Zone {
  id?: string
  x: number
  y: number
  w: number
  h: number
  status: string
  color?: string
  imageUrl?: string
}

export interface BoardCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  zoom: number
}

interface BoardCanvasProps {
  zones?: Zone[]
  onSelectionComplete?: (selection: { x: number; y: number; w: number; h: number }) => void
  onZoneClick?: (zone: Zone) => void
  disabled?: boolean
  cellSize?: number
  compositeUrl?: string
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
  onZoomChange?: (zoom: number) => void
}

export const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(function BoardCanvas({
  zones = [],
  onSelectionComplete,
  onZoneClick,
  disabled = false,
  cellSize = DEFAULT_CELL_SIZE,
  compositeUrl,
  canvasRef: externalCanvasRef,
  onZoomChange,
}, ref) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)
  const [compositeImage, setCompositeImage] = useState<HTMLImageElement | null>(null)
  const [zoneImages, setZoneImages] = useState<Map<string, HTMLImageElement>>(new Map())

  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const lastPanPoint = useRef({ x: 0, y: 0 })
  const lastPinchDistance = useRef<number | null>(null)

  // Expose zoom controls via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      setZoom(z => Math.min(MAX_ZOOM, z * (1 + ZOOM_STEP)))
    },
    zoomOut: () => {
      setZoom(z => Math.max(MIN_ZOOM, z / (1 + ZOOM_STEP)))
    },
    resetView: () => {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    },
    zoom,
  }), [zoom])

  // Notify parent of zoom changes
  useEffect(() => {
    onZoomChange?.(zoom)
  }, [zoom, onZoomChange])

  // Load composite image
  useEffect(() => {
    if (!compositeUrl) {
      setCompositeImage(null)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setCompositeImage(img)
    img.onerror = () => setCompositeImage(null)
    img.src = compositeUrl
  }, [compositeUrl])

  // Load individual zone images
  useEffect(() => {
    const newImages = new Map<string, HTMLImageElement>()
    let loadCount = 0
    const drawnZones = zones.filter(z => z.status.toUpperCase() === "DRAWN" && z.imageUrl)

    if (drawnZones.length === 0) {
      setZoneImages(new Map())
      return
    }

    drawnZones.forEach((zone) => {
      if (!zone.imageUrl) return
      const key = `${zone.x},${zone.y}`
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        newImages.set(key, img)
        loadCount++
        if (loadCount === drawnZones.length) {
          setZoneImages(new Map(newImages))
        }
      }
      img.onerror = () => {
        loadCount++
        if (loadCount === drawnZones.length) {
          setZoneImages(new Map(newImages))
        }
      }
      img.src = zone.imageUrl
    })
  }, [zones])

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

  // Handle keyboard for space-to-pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSelecting) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isSelecting])

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate zoom
      const delta = e.deltaY > 0 ? 1 / (1 + ZOOM_STEP) : 1 + ZOOM_STEP
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * delta))

      if (newZoom === zoom) return

      // Adjust pan to zoom toward cursor
      const scale = newZoom / zoom
      const newPanX = mouseX - (mouseX - pan.x) * scale
      const newPanY = mouseY - (mouseY - pan.y) * scale

      setZoom(newZoom)
      setPan({ x: newPanX, y: newPanY })
    },
    [zoom, pan]
  )

  // Get cell from mouse/touch position (accounting for zoom and pan)
  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return null

      const containerRect = container.getBoundingClientRect()

      let clientX: number, clientY: number
      if ("touches" in e) {
        if (e.touches.length === 0) return null
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      // Convert to container-relative coordinates
      const containerX = clientX - containerRect.left
      const containerY = clientY - containerRect.top

      // Account for pan, zoom, and the 8px padding offset
      const canvasX = (containerX - pan.x - 8) / zoom
      const canvasY = (containerY - pan.y - 8) / zoom

      const x = Math.floor(canvasX / cellSize)
      const y = Math.floor(canvasY / cellSize)
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null
      return { x, y }
    },
    [cellSize, zoom, pan]
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

    // Enable smooth image rendering (no pixelation on zoom)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const occMap = occupancy()

    // Clear
    ctx.fillStyle = "#FAF5EA" // paper
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Build set of drawn zone cells (to skip grid on them)
    const drawnCells = new Set<string>()
    zones.forEach((zone) => {
      const status = zone.status.toUpperCase()
      if (status === "DRAWN") {
        for (let x = zone.x; x < zone.x + zone.w; x++) {
          for (let y = zone.y; y < zone.y + zone.h; y++) {
            drawnCells.add(`${x},${y}`)
          }
        }
      }
    })

    // Draw grid lines only on empty cells
    ctx.strokeStyle = "#E9E1CF" // grid-line
    ctx.lineWidth = 1
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!drawnCells.has(`${x},${y}`)) {
          ctx.strokeRect(
            x * cellSize,
            y * cellSize,
            cellSize,
            cellSize
          )
        }
      }
    }

    // Draw zone images (individual or from composite)
    zones.forEach((zone) => {
      const status = zone.status.toUpperCase()

      if (status === "DRAWN") {
        // Try composite first
        if (compositeImage) {
          const sx = (zone.x / GRID_SIZE) * compositeImage.width
          const sy = (zone.y / GRID_SIZE) * compositeImage.height
          const sw = (zone.w / GRID_SIZE) * compositeImage.width
          const sh = (zone.h / GRID_SIZE) * compositeImage.height

          ctx.drawImage(
            compositeImage,
            sx, sy, sw, sh,
            zone.x * cellSize,
            zone.y * cellSize,
            zone.w * cellSize,
            zone.h * cellSize
          )
        } else {
          // Try individual zone image
          const key = `${zone.x},${zone.y}`
          const img = zoneImages.get(key)
          if (img) {
            ctx.drawImage(
              img,
              zone.x * cellSize,
              zone.y * cellSize,
              zone.w * cellSize,
              zone.h * cellSize
            )
          } else {
            // Fallback: red fill
            ctx.fillStyle = "#E8402A"
            ctx.fillRect(
              zone.x * cellSize,
              zone.y * cellSize,
              zone.w * cellSize,
              zone.h * cellSize
            )
          }
        }
      } else {
        // Reserved or Paid zones: colored fill
        const colors: Record<string, string> = {
          RESERVED: "#FFC800", // yellow
          PAID: "#FF8A00",     // orange
        }
        ctx.fillStyle = zone.color || colors[status] || "#2A5BFF"
        ctx.fillRect(
          zone.x * cellSize,
          zone.y * cellSize,
          zone.w * cellSize,
          zone.h * cellSize
        )
      }
    })

    // Draw hover cell
    if (hoverCell && !isSelecting && !occMap.has(`${hoverCell.x},${hoverCell.y}`)) {
      ctx.fillStyle = "rgba(42, 91, 255, 0.3)" // blue with opacity
      ctx.fillRect(
        hoverCell.x * cellSize,
        hoverCell.y * cellSize,
        cellSize,
        cellSize
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
        minX * cellSize,
        minY * cellSize,
        w * cellSize,
        h * cellSize
      )

      ctx.strokeStyle = valid ? "#2A5BFF" : "#E8402A"
      ctx.lineWidth = 2
      ctx.strokeRect(
        minX * cellSize,
        minY * cellSize,
        w * cellSize,
        h * cellSize
      )
    }
  }, [zones, hoverCell, selection, isSelectionValid, occupancy, cellSize, compositeImage, zoneImages])

  // Redraw on changes
  useEffect(() => {
    draw()
  }, [draw])

  // Container-level mouse handlers for panning
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Right click or middle click or space+click for panning
      const isRightClick = e.button === 2
      const isMiddleClick = e.button === 1
      if (isSpacePressed || isMiddleClick || isRightClick) {
        e.preventDefault()
        setIsPanning(true)
        lastPanPoint.current = { x: e.clientX, y: e.clientY }
        return
      }
    },
    [isSpacePressed]
  )

  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) {
        const dx = e.clientX - lastPanPoint.current.x
        const dy = e.clientY - lastPanPoint.current.y
        lastPanPoint.current = { x: e.clientX, y: e.clientY }
        setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      }
    },
    [isPanning]
  )

  const handleContainerMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
    }
  }, [isPanning])

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // Find zone at cell position
  const getZoneAtCell = useCallback(
    (cellX: number, cellY: number): Zone | null => {
      for (const zone of zones) {
        if (
          cellX >= zone.x &&
          cellX < zone.x + zone.w &&
          cellY >= zone.y &&
          cellY < zone.y + zone.h
        ) {
          return zone
        }
      }
      return null
    },
    [zones]
  )

  // Canvas-level mouse handlers for selection
  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      // Skip if we're in pan mode
      if (isSpacePressed) return
      // Skip right/middle click
      if ("button" in e && (e.button === 1 || e.button === 2)) return

      if (disabled) return
      const cell = getCellFromEvent(e)
      if (!cell) return

      // Check if clicking on an existing zone
      const clickedZone = getZoneAtCell(cell.x, cell.y)
      if (clickedZone) {
        if (onZoneClick && clickedZone.id) {
          onZoneClick(clickedZone)
        }
        return
      }

      setIsSelecting(true)
      setSelection({
        startX: cell.x,
        startY: cell.y,
        endX: cell.x,
        endY: cell.y,
      })
    },
    [disabled, getCellFromEvent, getZoneAtCell, onZoneClick, isSpacePressed]
  )

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      // Skip if panning
      if (isPanning) return

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
    [getCellFromEvent, isSelecting, selection, isPanning]
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

  // Track if we started a touch pan (vs selection)
  const isTouchPanning = useRef(false)

  // Prevent scroll while drawing on touch
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()

      // Pinch-to-zoom detection (2 fingers)
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        lastPinchDistance.current = Math.hypot(dx, dy)
        setIsPanning(true)
        isTouchPanning.current = true
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        lastPanPoint.current = { x: midX, y: midY }
        return
      }

      // Single finger: pan if zoomed, otherwise select
      if (e.touches.length === 1 && zoom > 1) {
        setIsPanning(true)
        isTouchPanning.current = true
        lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        return
      }

      isTouchPanning.current = false
      handlePointerDown(e)
    },
    [handlePointerDown, zoom]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()

      // Pinch-to-zoom handling (2 fingers)
      if (e.touches.length === 2 && lastPinchDistance.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.hypot(dx, dy)
        const scale = distance / lastPinchDistance.current
        lastPinchDistance.current = distance

        // Calculate midpoint for pan
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const panDx = midX - lastPanPoint.current.x
        const panDy = midY - lastPanPoint.current.y
        lastPanPoint.current = { x: midX, y: midY }

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const centerX = midX - rect.left
        const centerY = midY - rect.top

        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * scale))
        const zoomScale = newZoom / zoom

        setPan(p => ({
          x: centerX - (centerX - p.x) * zoomScale + panDx,
          y: centerY - (centerY - p.y) * zoomScale + panDy,
        }))
        setZoom(newZoom)
        return
      }

      // Single finger pan when zoomed
      if (e.touches.length === 1 && isTouchPanning.current) {
        const dx = e.touches[0].clientX - lastPanPoint.current.x
        const dy = e.touches[0].clientY - lastPanPoint.current.y
        lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setPan(p => ({ x: p.x + dx, y: p.y + dy }))
        return
      }

      handlePointerMove(e)
    },
    [handlePointerMove, zoom]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 0) {
        lastPinchDistance.current = null
        if (isTouchPanning.current) {
          isTouchPanning.current = false
          setIsPanning(false)
          return
        }
      }
      handlePointerUp()
    },
    [handlePointerUp]
  )

  // Global mouse up listener for panning (in case mouse leaves container)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) {
        setIsPanning(false)
      }
    }
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastPanPoint.current.x
        const dy = e.clientY - lastPanPoint.current.y
        lastPanPoint.current = { x: e.clientX, y: e.clientY }
        setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      }
    }
    if (isPanning) {
      window.addEventListener("mouseup", handleGlobalMouseUp)
      window.addEventListener("mousemove", handleGlobalMouseMove)
    }
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isPanning])

  const canvasWidth = GRID_SIZE * cellSize
  const canvasHeight = GRID_SIZE * cellSize

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden border border-lime/50 rounded-[6px] bg-paper touch-none select-none",
        isPanning && "cursor-grabbing",
        isSpacePressed && !isPanning && "cursor-grab"
      )}
      style={{
        width: canvasWidth + 16, // +16 for padding equivalent
        height: canvasHeight + 16,
        maxWidth: "100%",
        maxHeight: "calc(100vh - 200px)",
      }}
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${pan.x + 8}px, ${pan.y + 8}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={cn(
            "touch-none",
            isPanning || isSpacePressed ? "cursor-grab" : "cursor-crosshair",
            isPanning && "cursor-grabbing"
          )}
          style={{ imageRendering: "auto" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Reset zoom button */}
      {zoom !== 1 && (
        <button
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-lime text-black font-mono text-[10px] uppercase tracking-wider rounded-[4px] hover:bg-lime/90 transition-colors flex items-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1v4h4M11 11V7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.5 4.5a5 5 0 00-8.5-2L1 4M1.5 7.5a5 5 0 008.5 2l1-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reset view
        </button>
      )}

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-lime font-mono text-[10px] rounded">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Pan hint */}
      {isSpacePressed && !isPanning && zoom === 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-lime text-black font-mono text-[10px] rounded">
          DRAG TO PAN
        </div>
      )}

    </div>
  )
})
