"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { formatNumber } from "@/lib/utils"
import { zoneSizeInPixels } from "@/lib/pricing"

interface SelectionPanelProps {
  selection: { x: number; y: number; w: number; h: number } | null
  pricePerPixel: number
  tier: number
  onReserve: () => void
  isConnected: boolean
  isLoading?: boolean
}

export function SelectionPanel({
  selection,
  pricePerPixel,
  tier,
  onReserve,
  isConnected,
  isLoading = false,
}: SelectionPanelProps) {
  if (!selection) {
    return (
      <Card shadow="blue" className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Select a zone</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm text-ink/70">
            Click and drag on the canvas to select a rectangular zone.
            Minimum size is 1×1 cell (8×8 pixels).
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Chip>Tier {tier}</Chip>
            <Chip variant="info">{pricePerPixel} $PIXEL / px</Chip>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPixels = zoneSizeInPixels(selection.w, selection.h)
  const totalPrice = totalPixels * pricePerPixel

  return (
    <Card shadow="yellow" className="p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle>Your selection</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {/* Zone info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink/60">Position</span>
            <p className="font-medium">
              ({selection.x}, {selection.y})
            </p>
          </div>
          <div>
            <span className="text-ink/60">Size (cells)</span>
            <p className="font-medium">
              {selection.w} × {selection.h}
            </p>
          </div>
          <div>
            <span className="text-ink/60">Size (pixels)</span>
            <p className="font-medium">
              {selection.w * 8} × {selection.h * 8}
            </p>
          </div>
          <div>
            <span className="text-ink/60">Total pixels</span>
            <p className="font-medium">{formatNumber(totalPixels)}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t-2 border-ink pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-ink/60">Price per pixel</span>
            <Chip>{pricePerPixel} $PIXEL</Chip>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-pixel text-sm">Total</span>
            <span className="font-display text-2xl text-red">
              {formatNumber(totalPrice)} $PIXEL
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          {isConnected ? (
            <Button
              size="lg"
              className="w-full"
              onClick={onReserve}
              disabled={isLoading}
            >
              {isLoading ? "Reserving..." : "Reserve zone →"}
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled>
              Connect wallet to reserve
            </Button>
          )}
          <p className="text-xs text-ink/50 text-center mt-2">
            Reservation locks the zone for 10 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
