"use client"

import React, { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { Nav } from "@/components/nav"
import { BoardCanvas } from "@/components/board/board-canvas"
import { SelectionPanel } from "@/components/board/selection-panel"
import { PaymentFlowModal } from "@/components/board/payment-flow-modal"
import { Chip } from "@/components/ui/chip"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"
import { formatNumber } from "@/lib/utils"
import { TOTAL_PIXELS, zoneSizeInPixels, calculatePrice } from "@/lib/pricing"

interface Zone {
  x: number
  y: number
  w: number
  h: number
  status: "reserved" | "paid" | "drawn"
}

interface PriceState {
  pixelsSold: number
  currentTier: number
  basePrice: number
  pricePerPixel: number
}

export default function BoardPage() {
  const { address, isConnected } = useAccount()
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
            data.zones.map((z: { x: number; y: number; w: number; h: number; status: string }) => ({
              x: z.x,
              y: z.y,
              w: z.w,
              h: z.h,
              status: z.status.toLowerCase() as "reserved" | "paid" | "drawn",
            }))
          )
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
    if (!selection || !address) return
    setIsModalOpen(true)
  }, [selection, address])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    // Refresh zones after modal closes
    fetch("/api/zones")
      .then((res) => res.json())
      .then((data) => {
        setZones(
          data.zones.map((z: { x: number; y: number; w: number; h: number; status: string }) => ({
            x: z.x,
            y: z.y,
            w: z.w,
            h: z.h,
            status: z.status.toLowerCase() as "reserved" | "paid" | "drawn",
          }))
        )
      })
      .catch(console.error)
  }, [])

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
    <main className="min-h-screen flex flex-col bg-paper">
      <Nav />

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
            {isLoading ? (
              <div className="w-[784px] h-[784px] bg-grid-line rounded-[14px] border-2 border-ink flex items-center justify-center">
                <div className="text-center">
                  <Sprite map={SPRITE_MAPS.fire} pixelSize={8} className="mx-auto mb-4" />
                  <span className="font-pixel text-[10px] text-ink/40 uppercase animate-pulse">
                    Loading board...
                  </span>
                </div>
              </div>
            ) : (
              <BoardCanvas
                zones={zones}
                onSelectionComplete={handleSelectionComplete}
                disabled={!isConnected}
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
            <div className="bg-ink rounded-xl p-4 text-paper">
              <div className="flex items-center gap-2 mb-4">
                <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
                <span className="font-pixel text-[11px] uppercase">Live Stats</span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-pixel text-paper/50 mb-1">
                  <span>Board filled</span>
                  <span className="text-yellow">{percentFilled.toFixed(2)}%</span>
                </div>
                <div className="h-2 bg-paper/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentFilled}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow via-orange to-red"
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper/10 rounded-lg p-3">
                  <span className="font-pixel text-[8px] text-paper/50 uppercase">Sold</span>
                  <div className="font-display text-lg text-paper">
                    {formatNumber(priceState.pixelsSold)}
                  </div>
                </div>
                <div className="bg-paper/10 rounded-lg p-3">
                  <span className="font-pixel text-[8px] text-paper/50 uppercase">Tier</span>
                  <div className="font-display text-lg text-yellow">
                    {priceState.currentTier}
                  </div>
                </div>
                <div className="bg-paper/10 rounded-lg p-3 col-span-2">
                  <span className="font-pixel text-[8px] text-paper/50 uppercase">Price / Pixel</span>
                  <div className="font-display text-lg text-paper">
                    {priceState.pricePerPixel} <span className="text-sm text-paper/50">$PIXEL</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-paper/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow" />
                  <span className="text-[10px] text-paper/50">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange" />
                  <span className="text-[10px] text-paper/50">Paid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red" />
                  <span className="text-[10px] text-paper/50">Drawn</span>
                </div>
              </div>
            </div>

            {/* Selection Panel */}
            <SelectionPanel
              selection={selection}
              pricePerPixel={priceState.pricePerPixel}
              tier={priceState.currentTier}
              onReserve={handleReserve}
              isConnected={isConnected}
              isLoading={false}
            />

            {/* Connect prompt */}
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-yellow/20 border-2 border-yellow rounded-xl text-center"
              >
                <p className="font-pixel text-[11px] text-ink uppercase">
                  Connect wallet to claim pixels
                </p>
              </motion.div>
            )}

            {/* Burn info */}
            <div className="p-4 bg-red/10 border-2 border-red/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
                <span className="font-pixel text-[10px] text-red uppercase">Daily Burns</span>
              </div>
              <p className="text-sm text-ink/70">
                All $PIXEL is burned every 24h. Zero mercy on supply.
              </p>
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
        wallet={address}
      />
    </main>
  )
}
