import { NextRequest, NextResponse } from "next/server"
import { prisma, PrismaTransactionClient } from "@/lib/prisma"
import { calculateFees, isListingExpired } from "@/lib/marketplace"
import { getTierForPixelsSold } from "@/lib/pricing"

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// POST /api/marketplace/buy - Buy a listed zone
export async function POST(request: NextRequest) {
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

    // Get listing with zone
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { zone: true },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Check listing status
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing is no longer active" },
        { status: 400 }
      )
    }

    // Check expiration
    if (isListingExpired(listing.expiresAt)) {
      // Mark as expired
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json(
        { error: "Listing has expired" },
        { status: 400 }
      )
    }

    // Prevent self-purchase
    if (listing.seller.toLowerCase() === wallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Cannot buy your own listing" },
        { status: 400 }
      )
    }

    // Demo mode: complete purchase immediately
    if (DEMO_MODE) {
      return await completePurchase(listing, wallet)
    }

    // Production: would create a sale reservation for payment
    // For now, just return an error
    return NextResponse.json(
      { error: "Production mode not yet implemented" },
      { status: 501 }
    )
  } catch (error) {
    console.error("Error buying listing:", error)
    return NextResponse.json(
      { error: "Failed to buy listing" },
      { status: 500 }
    )
  }
}

// Complete purchase (demo mode or after payment verification)
async function completePurchase(
  listing: {
    id: string
    zoneId: string
    seller: string
    askingPrice: bigint
    zone: {
      id: string
      wallet: string
    }
  },
  buyerWallet: string
) {
  if (!prisma || !listing) {
    return NextResponse.json({ error: "Invalid state" }, { status: 500 })
  }

  // Calculate fees
  const { platformFee, sellerProceeds } = calculateFees(listing.askingPrice)

  // Get current tier
  const priceState = await prisma.priceState.findFirst()
  const tierAtSale = priceState
    ? getTierForPixelsSold(priceState.pixelsSold)
    : 1

  // Atomic transaction
  const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Update zone ownership
    await tx.zone.update({
      where: { id: listing.zoneId },
      data: {
        wallet: buyerWallet,
        previousOwner: listing.seller,
      },
    })

    // Update listing status
    await tx.listing.update({
      where: { id: listing.id },
      data: { status: "SOLD" },
    })

    // Create sale record
    const sale = await tx.sale.create({
      data: {
        zoneId: listing.zoneId,
        listingId: listing.id,
        seller: listing.seller,
        buyer: buyerWallet,
        salePrice: listing.askingPrice,
        platformFee,
        sellerProceeds,
        tierAtSale,
        txSignature: DEMO_MODE ? `DEMO_SALE_${Date.now()}` : null,
        blockTime: DEMO_MODE ? new Date() : null,
      },
    })

    // Log event
    await tx.event.create({
      data: {
        type: "ZONE_SOLD",
        zoneId: listing.zoneId,
        wallet: buyerWallet,
        data: {
          saleId: sale.id,
          listingId: listing.id,
          seller: listing.seller,
          buyer: buyerWallet,
          salePrice: listing.askingPrice.toString(),
          platformFee: platformFee.toString(),
          sellerProceeds: sellerProceeds.toString(),
        },
      },
    })

    return sale
  })

  return NextResponse.json({
    success: true,
    sale: {
      id: result.id,
      zoneId: result.zoneId,
      salePrice: result.salePrice.toString(),
      platformFee: result.platformFee.toString(),
      sellerProceeds: result.sellerProceeds.toString(),
    },
  })
}
