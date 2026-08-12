"use client"

import React from "react"
import { formatNumber } from "@/lib/utils"

interface StatsTickerProps {
  pixelsSold?: number
  pixelsBurned?: number
  currentPrice?: number
}

export function StatsTicker({
  pixelsSold = 0,
  pixelsBurned = 0,
  currentPrice = 10,
}: StatsTickerProps) {
  const totalPixels = 1_048_576 // 1024 * 1024

  const content = (
    <>
      <span className="mx-8">
        PIXELS SOLD: {formatNumber(pixelsSold)} / {formatNumber(totalPixels)}
      </span>
      <span className="mx-8">•</span>
      <span className="mx-8">$BLOKR BURNED: {formatNumber(pixelsBurned)}</span>
      <span className="mx-8">•</span>
      <span className="mx-8">CURRENT PRICE: {currentPrice} $BLOKR / PX</span>
      <span className="mx-8">•</span>
    </>
  )

  return (
    <div className="bg-lime overflow-hidden py-3">
      <div className="animate-marquee whitespace-nowrap font-mono text-[11px] text-black uppercase tracking-wider">
        {/* Duplicate content for seamless loop */}
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  )
}
