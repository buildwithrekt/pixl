import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    // Get all paid/drawn zones
    const zones = await prisma.zone.findMany({
      where: {
        status: { in: ["PAID", "DRAWN"] },
      },
      select: {
        id: true,
        x: true,
        y: true,
        w: true,
        h: true,
        status: true,
        wallet: true,
        projectName: true,
        imageUrl: true,
        originalImageUrl: true,
        totalPixels: true,
        totalPrice: true,
        paidAt: true,
      },
      orderBy: { paidAt: "desc" },
    })

    // Convert BigInt to string for JSON serialization
    const serializedZones = zones.map((zone) => ({
      ...zone,
      totalPrice: zone.totalPrice.toString(),
      paidAt: zone.paidAt?.toISOString() || null,
    }))

    return NextResponse.json({ zones: serializedZones })
  } catch (error) {
    console.error("Error fetching gallery:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch gallery", details: errorMessage },
      { status: 500 }
    )
  }
}
