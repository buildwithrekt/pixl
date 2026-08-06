import { NextRequest, NextResponse } from "next/server"
import { generateComposite, getCurrentCompositeUrl, updateComposite } from "@/lib/composite"

// GET - Serve current composite image
export async function GET() {
  try {
    const compositeUrl = await getCurrentCompositeUrl()

    if (!compositeUrl) {
      // Generate fresh composite
      const buffer = await generateComposite()

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        },
      })
    }

    // If it's a data URL, decode and return
    if (compositeUrl.startsWith("data:image/png;base64,")) {
      const base64 = compositeUrl.replace("data:image/png;base64,", "")
      const buffer = Buffer.from(base64, "base64")

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=60",
        },
      })
    }

    // Redirect to CDN URL
    return NextResponse.redirect(compositeUrl)
  } catch (error) {
    console.error("Error serving composite:", error)
    return NextResponse.json(
      { error: "Failed to generate composite" },
      { status: 500 }
    )
  }
}

// POST - Regenerate composite (called after zone is drawn)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const compositeUrl = await updateComposite()

    return NextResponse.json({
      success: true,
      url: compositeUrl,
    })
  } catch (error) {
    console.error("Error regenerating composite:", error)
    return NextResponse.json(
      { error: "Failed to regenerate composite" },
      { status: 500 }
    )
  }
}
