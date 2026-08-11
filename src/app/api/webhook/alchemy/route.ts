import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTransaction, getTreasuryAddress, getPixelTokenAddress } from "@/lib/evm"
import crypto from "crypto"

// Alchemy webhook payload types
interface AlchemyWebhookPayload {
  webhookId: string
  id: string
  createdAt: string
  type: string
  event: {
    network: string
    activity: AlchemyActivity[]
  }
}

interface AlchemyActivity {
  fromAddress: string
  toAddress: string
  blockNum: string
  hash: string
  value: number
  asset: string
  category: string
  rawContract: {
    rawValue: string
    address: string
    decimals: number
  }
}

// Verify Alchemy webhook signature
function verifyAlchemySignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("x-alchemy-signature") || ""
    const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY

    // Verify signature in production
    if (signingKey && process.env.NODE_ENV === "production") {
      if (!verifyAlchemySignature(payload, signature, signingKey)) {
        console.error("Invalid Alchemy webhook signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    const data: AlchemyWebhookPayload = JSON.parse(payload)
    console.log("Alchemy webhook received:", data.type)

    if (!prisma) {
      console.log("Database not configured, skipping webhook processing")
      return NextResponse.json({ received: true })
    }

    const treasuryAddress = getTreasuryAddress().toLowerCase()
    const pixelTokenAddress = getPixelTokenAddress().toLowerCase()

    // Process each activity
    for (const activity of data.event.activity) {
      // Only process ERC20 transfers to treasury
      if (
        activity.category !== "erc20" ||
        activity.toAddress.toLowerCase() !== treasuryAddress ||
        activity.rawContract.address.toLowerCase() !== pixelTokenAddress
      ) {
        continue
      }

      console.log("Processing payment:", activity.hash)

      // Verify transaction and extract memo
      const txResult = await verifyTransaction(activity.hash as `0x${string}`)

      if (!txResult.confirmed) {
        console.log("Transaction not confirmed:", activity.hash)
        continue
      }

      const memo = txResult.memo

      if (!memo) {
        console.log("No memo found in transaction:", activity.hash)

        // Log as orphan payment
        await prisma.orphanPayment.create({
          data: {
            wallet: activity.fromAddress,
            amount: BigInt(activity.rawContract.rawValue),
            memo: null,
            txSignature: activity.hash,
            blockTime: new Date(),
          },
        })
        continue
      }

      // Find reservation by memo (reservationId)
      const zone = await prisma.zone.findUnique({
        where: { reservationId: memo },
      })

      if (!zone) {
        console.log("No reservation found for memo:", memo)

        // Log as orphan payment
        await prisma.orphanPayment.create({
          data: {
            wallet: activity.fromAddress,
            amount: BigInt(activity.rawContract.rawValue),
            memo,
            txSignature: activity.hash,
            blockTime: new Date(),
          },
        })
        continue
      }

      // Check if already processed
      if (zone.status !== "RESERVED") {
        console.log("Zone already processed:", zone.id, zone.status)
        continue
      }

      // Verify payment amount
      const paidAmount = BigInt(activity.rawContract.rawValue)
      if (paidAmount < zone.totalPrice) {
        console.log(
          "Insufficient payment:",
          paidAmount.toString(),
          "expected:",
          zone.totalPrice.toString()
        )
        continue
      }

      // Update zone status to PAID (or DRAWN if image already uploaded)
      const newStatus = zone.imageUrl ? "DRAWN" : "PAID"

      await prisma.$transaction(async (tx) => {
        await tx.zone.update({
          where: { id: zone.id },
          data: {
            status: newStatus,
            txSignature: activity.hash,
            blockTime: new Date(),
            paidAt: new Date(),
            expiresAt: null, // Clear TTL
          },
        })

        // Update pixels sold
        await tx.priceState.update({
          where: { id: "singleton" },
          data: {
            pixelsSold: { increment: zone.totalPixels },
          },
        })

        // Log event
        await tx.event.create({
          data: {
            type: "ZONE_PAID",
            zoneId: zone.id,
            wallet: zone.wallet,
            data: {
              txSignature: activity.hash,
              amount: paidAmount.toString(),
            },
          },
        })
      })

      console.log("Payment confirmed for zone:", zone.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Alchemy webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
