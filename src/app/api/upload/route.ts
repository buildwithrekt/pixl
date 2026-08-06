import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import sharp from "sharp"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const zoneId = formData.get("zoneId") as string | null
    const wallet = formData.get("wallet") as string | null

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!zoneId) {
      return NextResponse.json({ error: "No zoneId provided" }, { status: 400 })
    }

    if (!wallet) {
      return NextResponse.json({ error: "No wallet provided" }, { status: 400 })
    }

    // Check if database is configured
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    // Find the zone
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
    })

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    // Verify ownership
    if (zone.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Verify zone status (must be PAID to upload)
    if (zone.status !== "PAID") {
      return NextResponse.json(
        { error: `Zone is ${zone.status}, must be PAID to upload` },
        { status: 400 }
      )
    }

    // Process image
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image metadata
    const metadata = await sharp(buffer).metadata()

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 })
    }

    // Calculate expected zone size in pixels
    const expectedWidth = zone.w * 8
    const expectedHeight = zone.h * 8

    // Resize image to exact zone dimensions
    const resizedBuffer = await sharp(buffer)
      .resize(expectedWidth, expectedHeight, { fit: "cover" })
      .png()
      .toBuffer()

    // Upload to Vercel Blob
    const blob = await put(`zones/${zoneId}.png`, resizedBuffer, {
      access: "public",
      contentType: "image/png",
    })

    // Update zone with image URL and set status to DRAWN
    await prisma.zone.update({
      where: { id: zoneId },
      data: {
        imageUrl: blob.url,
        status: "DRAWN",
      },
    })

    // Log event
    await prisma.event.create({
      data: {
        type: "ZONE_DRAWN",
        zoneId,
        wallet,
        data: {
          imageUrl: blob.url,
          originalSize: `${metadata.width}x${metadata.height}`,
          finalSize: `${expectedWidth}x${expectedHeight}`,
        },
      },
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
