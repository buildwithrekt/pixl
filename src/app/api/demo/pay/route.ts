import { NextRequest, NextResponse } from "next/server"
import { prisma, PrismaTransactionClient } from "@/lib/prisma"

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export async function POST(request: NextRequest) {
  // Only allow in demo mode
  if (!DEMO_MODE) {
    return NextResponse.json(
      { error: "Demo mode is not enabled" },
      { status: 403 }
    )
  }

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    const { zoneId, reservationId } = await request.json()

    if (!zoneId || !reservationId) {
      return NextResponse.json(
        { error: "Missing zoneId or reservationId" },
        { status: 400 }
      )
    }

    // Find the zone
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
    })

    if (!zone) {
      return NextResponse.json(
        { error: "Zone not found" },
        { status: 404 }
      )
    }

    if (zone.reservationId !== reservationId) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      )
    }

    // Update zone status to PAID (or DRAWN if image was uploaded)
    const newStatus = zone.imageUrl ? "DRAWN" : "PAID"

    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Update zone
      await tx.zone.update({
        where: { id: zoneId },
        data: {
          status: newStatus,
          paidAt: new Date(),
          txSignature: `DEMO_TX_${Date.now()}`,
          expiresAt: null, // Clear expiration
        },
      })

      // Update price state
      await tx.priceState.update({
        where: { id: "singleton" },
        data: {
          pixelsSold: {
            increment: zone.totalPixels,
          },
        },
      })

      // Log event
      await tx.event.create({
        data: {
          type: "ZONE_PAID",
          zoneId: zone.id,
          wallet: zone.wallet,
          data: {
            demo: true,
            totalPrice: zone.totalPrice.toString(),
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      status: newStatus,
    })
  } catch (error) {
    console.error("Demo payment error:", error)
    return NextResponse.json(
      { error: "Failed to process demo payment" },
      { status: 500 }
    )
  }
}
