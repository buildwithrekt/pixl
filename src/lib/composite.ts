import sharp, { OverlayOptions } from "sharp"
import { put } from "@vercel/blob"
import { prisma } from "./prisma"

const CANVAS_SIZE = 1024 // 1024×1024 pixels
const CELL_SIZE = 8 // 8×8 pixels per cell

// Generate composite canvas PNG
export async function generateComposite(): Promise<Buffer> {
  if (!prisma) {
    throw new Error("Database not configured")
  }

  // Get all drawn zones
  const zones = await prisma.zone.findMany({
    where: {
      status: "DRAWN",
      imageUrl: { not: null },
    },
    select: {
      x: true,
      y: true,
      w: true,
      h: true,
      imageUrl: true,
    },
  })

  // Create blank canvas with paper color
  const canvas = sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 250, g: 245, b: 234, alpha: 1 }, // #FAF5EA (paper)
    },
  })

  // Composite each zone image onto the canvas
  const composites: OverlayOptions[] = []

  for (const zone of zones) {
    if (!zone.imageUrl) continue

    try {
      // Fetch and resize zone image
      const response = await fetch(zone.imageUrl)
      const imageBuffer = Buffer.from(await response.arrayBuffer())

      // Calculate pixel position and size
      const left = zone.x * CELL_SIZE
      const top = zone.y * CELL_SIZE
      const width = zone.w * CELL_SIZE
      const height = zone.h * CELL_SIZE

      // Resize image to exact zone size
      const resizedImage = await sharp(imageBuffer)
        .resize(width, height, { fit: "fill" })
        .toBuffer()

      composites.push({
        input: resizedImage,
        left,
        top,
      })
    } catch (error) {
      console.error(`Error processing zone image: ${zone.imageUrl}`, error)
    }
  }

  // Apply all composites
  const compositeBuffer = await canvas.composite(composites).png().toBuffer()

  return compositeBuffer
}

// Generate and save composite to storage
export async function updateComposite(): Promise<string> {
  const compositeBuffer = await generateComposite()

  // Upload to Vercel Blob
  const timestamp = Date.now()
  const blob = await put(`composite/canvas-${timestamp}.png`, compositeBuffer, {
    access: "public",
    contentType: "image/png",
  })

  const compositeUrl = blob.url

  // Log event
  if (prisma) {
    const zonesCount = await prisma.zone.count({
      where: { status: "DRAWN" },
    })

    const priceState = await prisma.priceState.findUnique({
      where: { id: "singleton" },
    })

    await prisma.event.create({
      data: {
        type: "COMPOSITE_UPDATED",
        data: {
          zonesCount,
          pixelsSold: priceState?.pixelsSold || 0,
          url: compositeUrl,
        },
      },
    })

    // Create snapshot
    await prisma.snapshot.create({
      data: {
        imageUrl: compositeUrl,
        pixelsSold: priceState?.pixelsSold || 0,
        zonesCount,
        tier: priceState?.currentTier || 1,
      },
    })
  }

  return compositeUrl
}

// Get current composite URL
export async function getCurrentCompositeUrl(): Promise<string | null> {
  if (!prisma) return null

  const latestSnapshot = await prisma.snapshot.findFirst({
    orderBy: { createdAt: "desc" },
    select: { imageUrl: true },
  })

  return latestSnapshot?.imageUrl || null
}
