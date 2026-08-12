import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getTierForPixelsSold,
  getMultiplierForTier,
  TOTAL_PIXELS,
} from "@/lib/pricing"

export async function GET() {
  try {
    if (!prisma) {
      // Return mock data when database isn't configured
      const mockPixelsSold = 12500
      const tier = getTierForPixelsSold(mockPixelsSold)
      const multiplier = getMultiplierForTier(tier)
      const basePrice = 75 // $BLOKR per pixel base

      return NextResponse.json({
        pixelsSold: mockPixelsSold,
        totalPixels: TOTAL_PIXELS,
        percentSold: ((mockPixelsSold / TOTAL_PIXELS) * 100).toFixed(2),
        currentTier: tier,
        multiplier,
        basePrice,
        pricePerPixel: basePrice * multiplier,
      })
    }

    // Get current price state
    let priceState = await prisma.priceState.findUnique({
      where: { id: "singleton" },
    })

    if (!priceState) {
      // Initialize with default values
      priceState = await prisma.priceState.create({
        data: {
          id: "singleton",
          pixelsSold: 0,
          currentTier: 1,
          basePrice: 75, // $BLOKR per pixel base
        },
      })
    }

    const tier = getTierForPixelsSold(priceState.pixelsSold)
    const multiplier = getMultiplierForTier(tier)

    return NextResponse.json({
      pixelsSold: priceState.pixelsSold,
      totalPixels: TOTAL_PIXELS,
      percentSold: ((priceState.pixelsSold / TOTAL_PIXELS) * 100).toFixed(2),
      currentTier: tier,
      multiplier,
      basePrice: priceState.basePrice,
      pricePerPixel: priceState.basePrice * multiplier,
    })
  } catch (error) {
    console.error("Error fetching price:", error)
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    )
  }
}
