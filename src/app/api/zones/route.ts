import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!prisma) {
      // Return mock data when database isn't configured
      return NextResponse.json({
        zones: [
          { x: 10, y: 10, w: 5, h: 5, status: "DRAWN" },
          { x: 20, y: 30, w: 8, h: 4, status: "PAID" },
          { x: 50, y: 20, w: 3, h: 6, status: "RESERVED" },
        ],
      })
    }

    // Get all active zones (not expired)
    const zones = await prisma.zone.findMany({
      where: {
        status: { in: ["RESERVED", "PAID", "DRAWN"] },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
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
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ zones })
  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    )
  }
}
