"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"

interface ConfirmStepProps {
  selection: {
    x: number
    y: number
    w: number
    h: number
  }
  pricing: {
    tier: number
    pricePerPixel: number
    totalPixels: number
    totalPrice: bigint
  }
  onConfirm: () => void
  isLoading: boolean
}

export function ConfirmStep({
  selection,
  pricing,
  onConfirm,
  isLoading,
}: ConfirmStepProps) {
  const pixelWidth = selection.w * 8
  const pixelHeight = selection.h * 8

  return (
    <div className="space-y-6">
      {/* Zone preview */}
      <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-4">
        <div className="flex items-start gap-4">
          {/* Mini preview */}
          <div
            className="border border-lime/50 rounded bg-lime/20 flex-shrink-0"
            style={{
              width: Math.min(selection.w * 4, 80),
              height: Math.min(selection.h * 4, 80),
            }}
          />

          {/* Zone info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-500 uppercase">
                Position
              </span>
              <span className="text-sm text-white">
                ({selection.x}, {selection.y})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-500 uppercase">
                Size
              </span>
              <span className="text-sm text-white">
                {selection.w}×{selection.h} cells ({pixelWidth}×{pixelHeight} px)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-500 uppercase">
                Pixels
              </span>
              <span className="text-sm font-medium text-white">
                {pricing.totalPixels.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm text-white">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current tier</span>
            <Chip variant="secondary">TIER {pricing.tier}</Chip>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Price per pixel</span>
            <span className="text-sm text-white">
              {pricing.pricePerPixel} $BLOKR
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total pixels</span>
            <span className="text-sm text-white">
              {pricing.totalPixels.toLocaleString()}
            </span>
          </div>

          <div className="h-px bg-gray-700" />

          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-white">Total</span>
            <Chip>{pricing.totalPrice.toLocaleString()} $BLOKR</Chip>
          </div>
        </CardContent>
      </div>

      {/* Reserve notice */}
      <p className="text-sm text-gray-500 text-center">
        Reserving will lock this zone for{" "}
        <span className="font-mono text-lime">10 minutes</span> at the current
        price.
      </p>

      {/* Action */}
      <Button
        size="lg"
        className="w-full"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Reserving..." : "Reserve zone"}
      </Button>
    </div>
  )
}
