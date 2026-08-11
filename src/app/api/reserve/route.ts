import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculatePrice, zoneSizeInPixels } from "@/lib/pricing"
import { v4 as uuidv4 } from "uuid"

const RESERVATION_TTL_MINUTES = 10

export async function POST(request: NextRequest) {
  try {
    // Check if Prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { x, y, w, h, wallet } = body

    // Validate input
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof w !== "number" ||
      typeof h !== "number" ||
      !wallet
    ) {
      return NextResponse.json(
        { error: "Invalid input: x, y, w, h (numbers) and wallet required" },
        { status: 400 }
      )
    }

    // Validate bounds (128×128 grid)
    if (x < 0 || y < 0 || x + w > 128 || y + h > 128) {
      return NextResponse.json(
        { error: "Zone out of bounds (0-127)" },
        { status: 400 }
      )
    }

    // Validate minimum size
    if (w < 1 || h < 1) {
      return NextResponse.json(
        { error: "Minimum zone size is 1×1 cell" },
        { status: 400 }
      )
    }

    // Transaction: check overlap, get price, create reservation
    const result = await prisma.$transaction(async (tx) => {
      // Check for overlapping zones (not expired)
      const overlapping = await tx.zone.findFirst({
        where: {
          status: { in: ["RESERVED", "PAID", "DRAWN"] },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
          // Check rectangle overlap
          x: { lt: x + w },
          y: { lt: y + h },
          AND: [
            {
              OR: [
                { x: { gte: x } },
                {
                  x: { lt: x },
                  // x + w > selection.x
                },
              ],
            },
          ],
        },
      })

      // More precise overlap check
      const existingZones = await tx.zone.findMany({
        where: {
          status: { in: ["RESERVED", "PAID", "DRAWN"] },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: { x: true, y: true, w: true, h: true },
      })

      // Check each existing zone for overlap
      for (const zone of existingZones) {
        const overlapX = x < zone.x + zone.w && x + w > zone.x
        const overlapY = y < zone.y + zone.h && y + h > zone.y
        if (overlapX && overlapY) {
          throw new Error("Zone overlaps with existing reservation")
        }
      }

      // Get current price state
      let priceState = await tx.priceState.findUnique({
        where: { id: "singleton" },
      })

      if (!priceState) {
        // Initialize price state
        priceState = await tx.priceState.create({
          data: {
            id: "singleton",
            pixelsSold: 0,
            currentTier: 1,
            basePrice: 10,
          },
        })
      }

      // Calculate price
      const totalPixels = zoneSizeInPixels(w, h)
      const { tier, pricePerPixel, totalPrice } = calculatePrice(
        priceState.basePrice,
        priceState.pixelsSold,
        totalPixels
      )

      // Create reservation
      const reservationId = uuidv4()
      const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)

      const zone = await tx.zone.create({
        data: {
          x,
          y,
          w,
          h,
          wallet,
          status: "RESERVED",
          pricePerPixel,
          totalPixels,
          totalPrice,
          reservationId,
          expiresAt,
        },
      })

      // Log event
      await tx.event.create({
        data: {
          type: "ZONE_RESERVED",
          zoneId: zone.id,
          wallet,
          data: { x, y, w, h, totalPixels, totalPrice: totalPrice.toString(), tier },
        },
      })

      return {
        zone,
        pricing: {
          tier,
          pricePerPixel,
          totalPixels,
          totalPrice: totalPrice.toString(),
        },
      }
    })

    return NextResponse.json({
      success: true,
      reservationId: result.zone.reservationId,
      expiresAt: result.zone.expiresAt,
      zone: {
        id: result.zone.id,
        x: result.zone.x,
        y: result.zone.y,
        w: result.zone.w,
        h: result.zone.h,
      },
      pricing: result.pricing,
    })
  } catch (error) {
    console.error("Reservation error:", error)

    if (error instanceof Error) {
      if (error.message.includes("overlap")) {
        return NextResponse.json(
          { error: "Zone overlaps with existing reservation" },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    )
  }
}
