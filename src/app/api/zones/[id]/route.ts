import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    const zone = await prisma.zone.findUnique({
      where: { id },
      select: {
        id: true,
        x: true,
        y: true,
        w: true,
        h: true,
        wallet: true,
        status: true,
        pricePerPixel: true,
        totalPixels: true,
        totalPrice: true,
        txSignature: true,
        blockTime: true,
        paidAt: true,
        imageUrl: true,
        projectName: true,
        projectLink: true,
        createdAt: true,
      },
    })

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    return NextResponse.json({
      zone: {
        ...zone,
        totalPrice: zone.totalPrice.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching zone:", error)
    return NextResponse.json(
      { error: "Failed to fetch zone" },
      { status: 500 }
    )
  }
}
