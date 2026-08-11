import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateFloorPrice } from "@/lib/marketplace"
import { getTierForPixelsSold, getMultiplierForTier } from "@/lib/pricing"

// GET /api/marketplace/zone/[zoneId] - Get listing info for a zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const { zoneId } = await params

    // Get zone with listing
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { listing: true },
    })

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    // Get current tier for floor calculation
    const priceState = await prisma.priceState.findFirst()
    const currentTier = priceState
      ? getTierForPixelsSold(priceState.pixelsSold)
      : 1

    // Calculate floor price
    const purchaseTier = zone.purchaseTier || 1
    const floorPrice = calculateFloorPrice(
      zone.totalPrice,
      purchaseTier,
      currentTier
    )

    // Return listing info
    const listing =
      zone.listing && zone.listing.status === "ACTIVE"
        ? {
            id: zone.listing.id,
            askingPrice: zone.listing.askingPrice.toString(),
            floorPrice: zone.listing.floorPrice.toString(),
            seller: zone.listing.seller,
            status: zone.listing.status,
            expiresAt: zone.listing.expiresAt.toISOString(),
          }
        : null

    return NextResponse.json({
      listing,
      floorPrice: floorPrice.toString(),
      currentTier,
      purchaseTier,
    })
  } catch (error) {
    console.error("Error fetching zone listing:", error)
    return NextResponse.json(
      { error: "Failed to fetch zone listing" },
      { status: 500 }
    )
  }
}
