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
      <Card shadow="blue" className="p-4">
        <div className="flex items-start gap-4">
          {/* Mini preview */}
          <div
            className="border-2 border-ink rounded bg-yellow/30 flex-shrink-0"
            style={{
              width: Math.min(selection.w * 4, 80),
              height: Math.min(selection.h * 4, 80),
            }}
          />

          {/* Zone info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-ink/60 uppercase">
                Position
              </span>
              <span className="font-body text-sm">
                ({selection.x}, {selection.y})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-ink/60 uppercase">
                Size
              </span>
              <span className="font-body text-sm">
                {selection.w}×{selection.h} cells ({pixelWidth}×{pixelHeight} px)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-ink/60 uppercase">
                Pixels
              </span>
              <span className="font-body text-sm font-medium">
                {pricing.totalPixels.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing breakdown */}
      <Card shadow="yellow" className="p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">Current tier</span>
            <Chip variant="info">TIER {pricing.tier}</Chip>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">Price per pixel</span>
            <span className="font-body text-sm">
              {pricing.pricePerPixel} $PIXEL
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">Total pixels</span>
            <span className="font-body text-sm">
              {pricing.totalPixels.toLocaleString()}
            </span>
          </div>

          <div className="h-px bg-grid-line" />

          <div className="flex items-center justify-between">
            <span className="font-display font-bold">Total</span>
            <Chip>{pricing.totalPrice.toLocaleString()} $PIXEL</Chip>
          </div>
        </CardContent>
      </Card>

      {/* Reserve notice */}
      <p className="text-sm text-ink/60 text-center">
        Reserving will lock this zone for{" "}
        <span className="font-pixel text-ink">10 minutes</span> at the current
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
