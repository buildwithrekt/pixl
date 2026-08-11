import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  calculateFloorPrice,
  getListingExpiresAt,
  validateAskingPrice,
} from "@/lib/marketplace"
import { getTierForPixelsSold, getMultiplierForTier } from "@/lib/pricing"

// POST /api/marketplace/list - Create a new listing
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { zoneId, askingPrice, wallet } = body

    // Validate required fields
    if (!zoneId || !askingPrice || !wallet) {
      return NextResponse.json(
        { error: "zoneId, askingPrice, and wallet are required" },
        { status: 400 }
      )
    }

    // Get zone
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { listing: true },
    })

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    // Verify ownership
    if (zone.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { error: "You don't own this zone" },
        { status: 403 }
      )
    }

    // Check zone status
    if (zone.status !== "PAID" && zone.status !== "DRAWN") {
      return NextResponse.json(
        { error: "Zone must be paid or drawn to list" },
        { status: 400 }
      )
    }

    // Check if already listed
    if (zone.listing && zone.listing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Zone is already listed" },
        { status: 400 }
      )
    }

    // Get current tier for floor calculation
    const priceState = await prisma.priceState.findFirst()
    const currentTier = priceState
      ? getTierForPixelsSold(priceState.pixelsSold)
      : 1

    // Use purchase tier from zone, or fall back to tier 1
    const purchaseTier = zone.purchaseTier || 1
    const purchaseMultiplier = zone.purchaseMultiplier || getMultiplierForTier(purchaseTier)

    // Calculate floor price
    const floorPrice = calculateFloorPrice(
      zone.totalPrice,
      purchaseTier,
      currentTier
    )

    // Validate asking price
    const askingPriceBigInt = BigInt(askingPrice)
    const validation = validateAskingPrice(askingPriceBigInt, floorPrice)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Create listing in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create listing
      const listing = await tx.listing.create({
        data: {
          zoneId,
          seller: zone.wallet,
          askingPrice: askingPriceBigInt,
          floorPrice,
          purchaseTier,
          purchaseMultiplier,
          expiresAt: getListingExpiresAt(),
        },
      })

      // Log event
      await tx.event.create({
        data: {
          type: "ZONE_LISTED",
          zoneId,
          wallet: zone.wallet,
          data: {
            listingId: listing.id,
            askingPrice: askingPriceBigInt.toString(),
            floorPrice: floorPrice.toString(),
          },
        },
      })

      return listing
    })

    return NextResponse.json({
      listing: {
        id: result.id,
        zoneId: result.zoneId,
        askingPrice: result.askingPrice.toString(),
        floorPrice: result.floorPrice.toString(),
        expiresAt: result.expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}

// DELETE /api/marketplace/list - Cancel a listing
export async function DELETE(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { listingId, wallet } = body

    if (!listingId || !wallet) {
      return NextResponse.json(
        { error: "listingId and wallet are required" },
        { status: 400 }
      )
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Verify ownership
    if (listing.seller.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { error: "You don't own this listing" },
        { status: 403 }
      )
    }

    // Check if already sold/cancelled
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing is not active" },
        { status: 400 }
      )
    }

    // Cancel listing in transaction
    await prisma.$transaction(async (tx) => {
      // Update listing status
      await tx.listing.update({
        where: { id: listingId },
        data: { status: "CANCELLED" },
      })

      // Log event
      await tx.event.create({
        data: {
          type: "ZONE_UNLISTED",
          zoneId: listing.zoneId,
          wallet: listing.seller,
          data: { listingId },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling listing:", error)
    return NextResponse.json(
      { error: "Failed to cancel listing" },
      { status: 500 }
    )
  }
}
