"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { Nav } from "@/components/nav"
import { BoardCanvas, BoardCanvasHandle } from "@/components/board/board-canvas"
import { BoardToolbar } from "@/components/board/board-toolbar"
import { SelectionPanel } from "@/components/board/selection-panel"
import { PaymentFlowModal } from "@/components/board/payment-flow-modal"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"
import { formatNumber } from "@/lib/utils"
import { TOTAL_PIXELS, zoneSizeInPixels, calculatePrice } from "@/lib/pricing"

interface Zone {
  id: string
  x: number
  y: number
  w: number
  h: number
  status: "reserved" | "paid" | "drawn"
  imageUrl?: string
}

interface PriceState {
  pixelsSold: number
  currentTier: number
  basePrice: number
  pricePerPixel: number
}

const GRID_SIZE = 128

export default function BoardPage() {
  const router = useRouter()
  const { isSignedIn, signedAddress, openModal, isDemoMode, isComingSoon } = useWalletAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<BoardCanvasHandle>(null)
  const [zoom, setZoom] = useState(1)
  const [selection, setSelection] = useState<{
    x: number
    y: number
    w: number
    h: number
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zones, setZones] = useState<Zone[]>([])
  const [priceState, setPriceState] = useState<PriceState>({
    pixelsSold: 0,
    currentTier: 1,
    basePrice: 150,
    pricePerPixel: 150,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [cellSize, setCellSize] = useState(6) // Default cell size
  const [compositeUrl, setCompositeUrl] = useState<string | undefined>(undefined)

  // Calculate responsive cell size
  useEffect(() => {
    const updateCellSize = () => {
      const padding = 32 // Account for padding
      const sidebarWidth = 320 + 24 // Sidebar width + gap
      const availableWidth = window.innerWidth < 1024
        ? window.innerWidth - padding // Mobile: full width
        : window.innerWidth - sidebarWidth - padding // Desktop: minus sidebar

      // Calculate cell size to fit available width
      const maxCellSize = 6 // Desktop max
      const minCellSize = 2.5 // Mobile min
      const calculatedSize = Math.floor(availableWidth / GRID_SIZE * 10) / 10
      const newCellSize = Math.max(minCellSize, Math.min(maxCellSize, calculatedSize))

      setCellSize(newCellSize)
    }

    updateCellSize()
    window.addEventListener("resize", updateCellSize)
    return () => window.removeEventListener("resize", updateCellSize)
  }, [])

  // Fetch zones and price state
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [zonesRes, priceRes] = await Promise.all([
          fetch("/api/zones"),
          fetch("/api/price"),
        ])

        if (zonesRes.ok) {
          const data = await zonesRes.json()
          setZones(
            data.zones.map((z: { id: string; x: number; y: number; w: number; h: number; status: string; imageUrl?: string }) => ({
              id: z.id,
              x: z.x,
              y: z.y,
              w: z.w,
              h: z.h,
              status: z.status.toLowerCase() as "reserved" | "paid" | "drawn",
              imageUrl: z.imageUrl,
            }))
          )
          // Set composite URL with cache bust
          setCompositeUrl(`/api/composite?t=${Date.now()}`)
        }

        if (priceRes.ok) {
          const data = await priceRes.json()
          setPriceState({
            pixelsSold: data.pixelsSold,
            currentTier: data.currentTier,
            basePrice: data.basePrice,
            pricePerPixel: data.pricePerPixel,
          })
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSelectionComplete = useCallback(
    (sel: { x: number; y: number; w: number; h: number }) => {
      setSelection(sel)
    },
    []
  )

  const handleReserve = useCallback(() => {
    if (!selection || !signedAddress) return
    setIsModalOpen(true)
  }, [selection, signedAddress])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    // Refresh zones after modal closes
    fetch("/api/zones")
      .then((res) => res.json())
      .then((data) => {
        setZones(
          data.zones.map((z: { id: string; x: number; y: number; w: number; h: number; status: string; imageUrl?: string }) => ({
            id: z.id,
            x: z.x,
            y: z.y,
            w: z.w,
            h: z.h,
            status: z.status.toLowerCase() as "reserved" | "paid" | "drawn",
            imageUrl: z.imageUrl,
          }))
        )
      })
      .catch(console.error)
  }, [])

  // Handle clicking on an existing zone
  const handleZoneClick = useCallback(
    (zone: { id?: string }) => {
      if (zone.id) {
        router.push(`/zone/${zone.id}`)
      }
    },
    [router]
  )

  // Calculate pricing for current selection
  const selectionPricing = selection
    ? calculatePrice(
        priceState.basePrice,
        priceState.pixelsSold,
        zoneSizeInPixels(selection.w, selection.h)
      )
    : null

  const percentFilled = (priceState.pixelsSold / TOTAL_PIXELS) * 100

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Nav />

      {/* Coming soon banner */}
      {isComingSoon && (
        <div className="bg-lime py-2 px-4 text-center">
          <span className="font-mono text-[11px] text-black uppercase tracking-wider">
            Coming Soon - $BLOK token launching soon
          </span>
        </div>
      )}

      {/* Demo mode banner */}
      {isDemoMode && !isComingSoon && (
        <div className="bg-lime py-2 px-4 text-center">
          <span className="font-mono text-[11px] text-black uppercase tracking-wider">
            Demo Mode - No real wallet or payment required
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 md:gap-6">
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            {/* Toolbar */}
            <BoardToolbar canvasRef={canvasRef} boardRef={boardRef} zoom={zoom} className="mb-3" />

            {isLoading ? (
              <div
                style={{
                  width: GRID_SIZE * cellSize + 16, // +16 for padding
                  height: GRID_SIZE * cellSize + 16,
                }}
                className="bg-paper rounded-[6px] border border-lime/30 flex items-center justify-center"
              >
                <div className="text-center">
                  <Sprite map={SPRITE_MAPS.fire} pixelSize={8} className="mx-auto mb-4" />
                  <span className="font-mono text-[10px] text-gray-500 uppercase animate-pulse">
                    Loading board...
                  </span>
                </div>
              </div>
            ) : (
              <BoardCanvas
                ref={boardRef}
                zones={zones}
                onSelectionComplete={handleSelectionComplete}
                onZoneClick={handleZoneClick}
                disabled={!isSignedIn}
                cellSize={cellSize}
                compositeUrl={compositeUrl}
                canvasRef={canvasRef}
                onZoomChange={setZoom}
              />
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-80 shrink-0 space-y-4"
          >
            {/* Live Stats */}
            <div className="bg-gray-900 border border-gray-700 rounded-[6px] p-4 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
                <span className="font-mono text-[11px] uppercase text-white">Live Stats</span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                  <span>Board filled</span>
                  <span className="text-lime">{percentFilled.toFixed(2)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentFilled}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-lime"
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-3">
                  <span className="font-mono text-[8px] text-gray-500 uppercase">Sold</span>
                  <div className="font-display text-lg text-white">
                    {formatNumber(priceState.pixelsSold)}
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-3">
                  <span className="font-mono text-[8px] text-gray-500 uppercase">Tier</span>
                  <div className="font-display text-lg text-lime">
                    {priceState.currentTier}
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-3 col-span-2">
                  <span className="font-mono text-[8px] text-gray-500 uppercase">Price / Pixel</span>
                  <div className="font-display text-lg text-white">
                    {priceState.pricePerPixel} <span className="text-sm text-gray-500">$BLOK</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime" />
                  <span className="text-[10px] text-gray-500">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime/70" />
                  <span className="text-[10px] text-gray-500">Paid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime/40" />
                  <span className="text-[10px] text-gray-500">Drawn</span>
                </div>
              </div>
            </div>

            {/* Selection Panel */}
            <SelectionPanel
              selection={selection}
              pricePerPixel={priceState.pricePerPixel}
              tier={priceState.currentTier}
              onReserve={handleReserve}
              isConnected={isSignedIn}
              isLoading={false}
              isComingSoon={isComingSoon}
            />

            {/* Connect prompt */}
            {!isSignedIn && !isComingSoon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-lime text-black rounded-[6px] text-center cursor-pointer hover:bg-lime/90 transition-colors"
                onClick={openModal}
              >
                <p className="font-mono text-[11px] uppercase tracking-wider">
                  Connect wallet to claim pixels
                </p>
              </motion.div>
            )}

            {/* Coming soon prompt */}
            {isComingSoon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-900 border border-lime/30 rounded-[6px] text-center"
              >
                <p className="font-mono text-[11px] text-lime uppercase tracking-wider mb-1">
                  $BLOK Token Coming Soon
                </p>
                <p className="text-[12px] text-gray-400">
                  Pixel purchases will be available once the token launches
                </p>
              </motion.div>
            )}

            {/* Burn info */}
            <div className="p-4 bg-lime/10 border border-lime/30 rounded-[6px]">
              <div className="flex items-center gap-2 mb-2">
                <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
                <span className="font-mono text-[10px] text-lime uppercase">Daily Burns</span>
              </div>
              <p className="text-sm text-gray-400">
                All $BLOK is burned every 24h. Zero mercy on supply.
              </p>
            </div>

            {/* Controls help */}
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-[6px]">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-lime">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 4v4M7 10v0.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-mono text-[10px] text-lime uppercase">Controls</span>
              </div>
              <div className="space-y-2 text-[12px] text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Zoom</span>
                  <span className="font-mono text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">SCROLL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pan / Move</span>
                  <span className="font-mono text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">RIGHT-CLICK + DRAG</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Select zone</span>
                  <span className="font-mono text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">CLICK + DRAG</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reset view</span>
                  <span className="font-mono text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">CLICK %</span>
                </div>
              </div>
              {/* Mobile hint */}
              <div className="mt-3 pt-3 border-t border-gray-700 text-[11px] text-gray-500 lg:hidden">
                <span className="font-mono text-[9px] text-lime uppercase">Mobile:</span> Pinch to zoom, 1 finger to pan when zoomed
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment flow modal */}
      <PaymentFlowModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selection={selection}
        pricing={
          selectionPricing
            ? {
                tier: selectionPricing.tier,
                pricePerPixel: selectionPricing.pricePerPixel,
                totalPixels: selection ? zoneSizeInPixels(selection.w, selection.h) : 0,
                totalPrice: selectionPricing.totalPrice,
              }
            : null
        }
        wallet={signedAddress ?? undefined}
      />
    </main>
  )
}
