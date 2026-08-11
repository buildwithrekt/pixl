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

    // Verify zone status (must be RESERVED, PAID, or DRAWN to upload/update)
    if (zone.status !== "RESERVED" && zone.status !== "PAID" && zone.status !== "DRAWN") {
      return NextResponse.json(
        { error: `Zone is ${zone.status}, cannot upload` },
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

    // Resize image to exact zone dimensions (for canvas composite)
    const resizedBuffer = await sharp(buffer)
      .resize(expectedWidth, expectedHeight, { fit: "cover" })
      .png()
      .toBuffer()

    // Optimize original image (keep full resolution but compress)
    const originalBuffer = await sharp(buffer)
      .png({ quality: 90 })
      .toBuffer()

    // Upload both images to Vercel Blob in parallel
    const [resizedBlob, originalBlob] = await Promise.all([
      put(`zones/${zoneId}.png`, resizedBuffer, {
        access: "public",
        contentType: "image/png",
      }),
      put(`zones/${zoneId}-original.png`, originalBuffer, {
        access: "public",
        contentType: "image/png",
      }),
    ])

    // Update zone with both image URLs
    // Set status to DRAWN if PAID, keep DRAWN if already DRAWN
    await prisma.zone.update({
      where: { id: zoneId },
      data: {
        imageUrl: resizedBlob.url,
        originalImageUrl: originalBlob.url,
        ...(zone.status === "PAID" || zone.status === "DRAWN" ? { status: "DRAWN" } : {}),
      },
    })

    // Log event
    await prisma.event.create({
      data: {
        type: "ZONE_DRAWN",
        zoneId,
        wallet,
        data: {
          imageUrl: resizedBlob.url,
          originalImageUrl: originalBlob.url,
          isUpdate: !!zone.imageUrl,
          previousImageUrl: zone.imageUrl || null,
          previousOriginalImageUrl: zone.originalImageUrl || null,
          originalSize: `${metadata.width}x${metadata.height}`,
          finalSize: `${expectedWidth}x${expectedHeight}`,
        },
      },
    })

    return NextResponse.json({
      success: true,
      url: resizedBlob.url,
      originalUrl: originalBlob.url,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
