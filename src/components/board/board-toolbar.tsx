"use client"

import React, { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { BoardCanvasHandle } from "./board-canvas"

interface BoardToolbarProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  boardRef?: React.RefObject<BoardCanvasHandle | null>
  zoom?: number
  className?: string
}

export function BoardToolbar({ canvasRef, boardRef, zoom = 1, className }: BoardToolbarProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleZoomIn = useCallback(() => {
    boardRef?.current?.zoomIn()
  }, [boardRef])

  const handleZoomOut = useCallback(() => {
    boardRef?.current?.zoomOut()
  }, [boardRef])

  const handleResetView = useCallback(() => {
    boardRef?.current?.resetView()
  }, [boardRef])

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setDownloading(true)
    try {
      // Create a high-res version for download
      const scale = 2
      const exportCanvas = document.createElement("canvas")
      exportCanvas.width = canvas.width * scale
      exportCanvas.height = canvas.height * scale
      const ctx = exportCanvas.getContext("2d")
      if (!ctx) return

      // Scale and draw
      ctx.scale(scale, scale)
      ctx.drawImage(canvas, 0, 0)

      // Convert to blob and download
      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, "image/png")
      )
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `blok-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }, [canvasRef])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input")
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  const handleShareTwitter = useCallback(() => {
    const text = "Check out BLOKR, a collaborative pixel canvas on Robinhood Chain!"
    const url = window.location.href
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420"
    )
  }, [])

  const handleShareFarcaster = useCallback(() => {
    const text = "Check out BLOKR, a collaborative pixel canvas!"
    const url = window.location.href
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`,
      "_blank"
    )
  }, [])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Zoom controls */}
      {boardRef && (
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-700">
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center w-8 h-8 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
            title="Zoom out"
          >
            <MinusIcon />
          </button>
          <button
            onClick={handleResetView}
            className="flex items-center justify-center min-w-[52px] h-8 px-2 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all font-mono text-[10px] text-white"
            title="Reset view"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center w-8 h-8 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
            title="Zoom in"
          >
            <PlusIcon />
          </button>
        </div>
      )}

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all disabled:opacity-50"
        title="Download canvas"
      >
        <DownloadIcon />
        <span className="font-mono text-[10px] uppercase hidden sm:inline text-white">
          {downloading ? "..." : "Save"}
        </span>
      </button>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Copy link"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        <span className="font-mono text-[10px] uppercase hidden sm:inline text-white">
          {copied ? "Copied!" : "Link"}
        </span>
      </button>

      {/* Twitter/X */}
      <button
        onClick={handleShareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Share on X"
      >
        <XIcon />
      </button>

      {/* Farcaster */}
      <button
        onClick={handleShareFarcaster}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Share on Farcaster"
      >
        <FarcasterIcon />
      </button>
    </div>
  )
}

// Pixel-style icons
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <path
        d="M7 1v8M7 9L4 6M7 9l3-3M2 12h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <path
        d="M6 8l2-2M5 9L3 11a1.5 1.5 0 002 2l2-2M9 5l2-2a1.5 1.5 0 00-2-2L7 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-lime">
      <path
        d="M2 7l4 4 6-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FarcasterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
      <path d="M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <path
        d="M7 2v10M2 7h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <path
        d="M2 7h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}
