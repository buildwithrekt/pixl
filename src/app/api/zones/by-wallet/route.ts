import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/zones/by-wallet?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ zones: [] })
    }

    const wallet = request.nextUrl.searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet parameter is required" },
        { status: 400 }
      )
    }

    const zones = await prisma.zone.findMany({
      where: {
        wallet: {
          equals: wallet,
          mode: "insensitive",
        },
        status: {
          in: ["PAID", "DRAWN"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    })

    // Serialize BigInt values
    const serializedZones = zones.map((zone) => ({
      id: zone.id,
      x: zone.x,
      y: zone.y,
      w: zone.w,
      h: zone.h,
      status: zone.status,
      imageUrl: zone.imageUrl,
      originalImageUrl: zone.originalImageUrl,
      projectName: zone.projectName,
      projectLink: zone.projectLink,
      totalPixels: zone.totalPixels,
      totalPrice: zone.totalPrice.toString(),
      pricePerPixel: zone.pricePerPixel,
      createdAt: zone.createdAt.toISOString(),
      paidAt: zone.paidAt?.toISOString() || null,
      listing: zone.listing
        ? {
            id: zone.listing.id,
            askingPrice: zone.listing.askingPrice.toString(),
            floorPrice: zone.listing.floorPrice.toString(),
            status: zone.listing.status,
          }
        : null,
    }))

    return NextResponse.json({ zones: serializedZones })
  } catch (error) {
    console.error("Error fetching zones by wallet:", error)
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    )
  }
}
