import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/marketplace - List all active listings
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      // Return mock data when database isn't configured
      return NextResponse.json({
        listings: [],
        total: 0,
      })
    }

    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get("sort") || "recent"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const limit = parseInt(searchParams.get("limit") || "24", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "ACTIVE",
      expiresAt: { gt: new Date() }, // Not expired
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.askingPrice = {}
      if (minPrice) where.askingPrice.gte = BigInt(minPrice)
      if (maxPrice) where.askingPrice.lte = BigInt(maxPrice)
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any
    switch (sort) {
      case "price_asc":
        orderBy = { askingPrice: "asc" }
        break
      case "price_desc":
        orderBy = { askingPrice: "desc" }
        break
      case "size":
        orderBy = { zone: { totalPixels: "desc" } }
        break
      case "recent":
      default:
        orderBy = { createdAt: "desc" }
    }

    // Get total count
    const total = await prisma.listing.count({ where })

    // Get listings with zone data
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        zone: {
          select: {
            id: true,
            x: true,
            y: true,
            w: true,
            h: true,
            imageUrl: true,
            projectName: true,
            totalPixels: true,
            status: true,
          },
        },
      },
    })

    // Serialize BigInt values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedListings = listings.map((listing: any) => ({
      id: listing.id,
      zone: listing.zone,
      seller: listing.seller,
      askingPrice: listing.askingPrice.toString(),
      floorPrice: listing.floorPrice.toString(),
      purchaseTier: listing.purchaseTier,
      createdAt: listing.createdAt.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
    }))

    return NextResponse.json({
      listings: serializedListings,
      total,
    })
  } catch (error) {
    console.error("Error fetching marketplace listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    )
  }
}
