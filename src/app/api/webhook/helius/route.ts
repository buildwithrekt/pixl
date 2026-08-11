import { NextRequest, NextResponse } from "next/server"
import { prisma, PrismaTransactionClient } from "@/lib/prisma"
import crypto from "crypto"

// Helius webhook payload types
interface HeliusWebhookPayload {
  type: string
  timestamp: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

interface TokenTransfer {
  mint: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
}

interface HeliusTransaction {
  signature: string
  timestamp: number
  type: string
  source: string
  fee: number
  tokenTransfers: TokenTransfer[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nativeTransfers: any[]
  accountData: {
    account: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeBalanceChange: any
    tokenBalanceChanges: {
      mint: string
      userAccount: string
      rawTokenAmount: {
        tokenAmount: string
        decimals: number
      }
    }[]
  }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instructions: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any
}

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Extract memo from transaction
function extractMemo(transaction: HeliusTransaction): string | null {
  // Look for memo instruction
  for (const ix of transaction.instructions || []) {
    if (
      ix.programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr" ||
      ix.program === "spl-memo"
    ) {
      return ix.data || null
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("x-helius-signature") || ""
    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET

    // Verify signature in production
    if (webhookSecret && process.env.NODE_ENV === "production") {
      if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error("Invalid webhook signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    const data: HeliusWebhookPayload = JSON.parse(payload)
    console.log("Helius webhook received:", data.type)

    if (!prisma) {
      console.log("Database not configured, skipping webhook processing")
      return NextResponse.json({ received: true })
    }

    // Process each transaction
    for (const tx of data.data as HeliusTransaction[]) {
      const memo = extractMemo(tx)

      if (!memo) {
        console.log("No memo found in transaction:", tx.signature)
        continue
      }

      // Find reservation by memo (reservationId)
      const zone = await prisma.zone.findUnique({
        where: { reservationId: memo },
      })

      if (!zone) {
        console.log("No reservation found for memo:", memo)

        // Log as orphan payment
        const tokenTransfer = tx.tokenTransfers?.[0]
        if (tokenTransfer) {
          await prisma.orphanPayment.create({
            data: {
              wallet: tokenTransfer.fromUserAccount,
              amount: BigInt(Math.floor(tokenTransfer.tokenAmount)),
              memo,
              txSignature: tx.signature,
              blockTime: new Date(tx.timestamp * 1000),
            },
          })
        }
        continue
      }

      // Check if already processed
      if (zone.status !== "RESERVED") {
        console.log("Zone already processed:", zone.id, zone.status)
        continue
      }

      // Verify payment amount
      const tokenTransfer = tx.tokenTransfers?.find(
        (t) =>
          t.mint === process.env.NEXT_PUBLIC_PIXEL_TOKEN_MINT &&
          t.toUserAccount === process.env.TREASURY_ATA
      )

      if (!tokenTransfer) {
        console.log("No matching token transfer found")
        continue
      }

      const paidAmount = BigInt(Math.floor(tokenTransfer.tokenAmount))
      if (paidAmount < zone.totalPrice) {
        console.log(
          "Insufficient payment:",
          paidAmount.toString(),
          "expected:",
          zone.totalPrice.toString()
        )
        continue
      }

      // Update zone status to PAID
      await prisma.$transaction(async (txPrisma: PrismaTransactionClient) => {
        await txPrisma.zone.update({
          where: { id: zone.id },
          data: {
            status: "PAID",
            txSignature: tx.signature,
            blockTime: new Date(tx.timestamp * 1000),
            paidAt: new Date(),
            expiresAt: null, // Clear TTL
          },
        })

        // Update pixels sold
        await txPrisma.priceState.update({
          where: { id: "singleton" },
          data: {
            pixelsSold: { increment: zone.totalPixels },
          },
        })

        // Log event
        await txPrisma.event.create({
          data: {
            type: "ZONE_PAID",
            zoneId: zone.id,
            wallet: zone.wallet,
            data: {
              txSignature: tx.signature,
              amount: paidAmount.toString(),
            },
          },
        })
      })

      console.log("Payment confirmed for zone:", zone.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
