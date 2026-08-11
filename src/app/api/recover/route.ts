import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTransaction, getTreasuryAddress, getPixelTokenAddress } from "@/lib/evm"

export async function POST(request: NextRequest) {
  try {
    const { txHash } = await request.json()

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { success: false, message: "Transaction hash is required" },
        { status: 400 }
      )
    }

    // Normalize hash
    const normalizedHash = txHash.startsWith("0x")
      ? (txHash as `0x${string}`)
      : (`0x${txHash}` as `0x${string}`)

    // Verify the transaction on-chain
    const txResult = await verifyTransaction(normalizedHash)

    if (!txResult.confirmed) {
      return NextResponse.json({
        success: false,
        message: "Transaction not found or not confirmed on-chain.",
      })
    }

    // Check if payment was to our treasury
    const treasuryAddress = getTreasuryAddress().toLowerCase()
    if (txResult.to?.toLowerCase() !== treasuryAddress) {
      return NextResponse.json({
        success: false,
        message: "This transaction was not sent to the BLOKR treasury.",
        data: {
          txHash: normalizedHash,
          from: txResult.from || "unknown",
          amount: txResult.amount ? (Number(txResult.amount) / 1e18).toLocaleString() : "0",
          memo: txResult.memo,
          status: "invalid" as const,
        },
      })
    }

    // Check if this transaction is already linked to a zone
    if (prisma) {
      const existingZone = await prisma.zone.findFirst({
        where: { txSignature: normalizedHash },
      })

      if (existingZone) {
        return NextResponse.json({
          success: true,
          message: "This payment is already linked to a zone.",
          data: {
            txHash: normalizedHash,
            from: txResult.from || "unknown",
            amount: txResult.amount ? (Number(txResult.amount) / 1e18).toLocaleString() : "0",
            memo: txResult.memo,
            status: "matched" as const,
            zoneId: existingZone.id,
          },
        })
      }

      // Check if memo matches a reservation
      if (txResult.memo) {
        const matchingZone = await prisma.zone.findFirst({
          where: { reservationId: txResult.memo },
        })

        if (matchingZone) {
          // Found matching reservation - update it if not already paid
          if (matchingZone.status === "RESERVED" || matchingZone.status === "EXPIRED") {
            await prisma.zone.update({
              where: { id: matchingZone.id },
              data: {
                status: "PAID",
                txSignature: normalizedHash,
                paidAt: new Date(),
              },
            })

            // Log recovery event
            await prisma.event.create({
              data: {
                type: "PAYMENT_RECOVERED",
                zoneId: matchingZone.id,
                wallet: txResult.from || "",
                data: {
                  txHash: normalizedHash,
                  amount: txResult.amount?.toString(),
                  memo: txResult.memo,
                },
              },
            })

            return NextResponse.json({
              success: true,
              message: "Payment recovered! Your zone has been activated.",
              data: {
                txHash: normalizedHash,
                from: txResult.from || "unknown",
                amount: txResult.amount ? (Number(txResult.amount) / 1e18).toLocaleString() : "0",
                memo: txResult.memo,
                status: "matched" as const,
                zoneId: matchingZone.id,
              },
            })
          }
        }
      }

      // Check if already in orphan queue
      const existingOrphan = await prisma.event.findFirst({
        where: {
          type: "ORPHAN_PAYMENT",
          data: {
            path: ["txHash"],
            equals: normalizedHash,
          },
        },
      })

      if (!existingOrphan) {
        // Add to orphan queue
        await prisma.event.create({
          data: {
            type: "ORPHAN_PAYMENT",
            wallet: txResult.from || "",
            data: {
              txHash: normalizedHash,
              from: txResult.from,
              amount: txResult.amount?.toString(),
              memo: txResult.memo,
              timestamp: new Date().toISOString(),
            },
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified but not linked to any zone.",
      data: {
        txHash: normalizedHash,
        from: txResult.from || "unknown",
        amount: txResult.amount ? (Number(txResult.amount) / 1e18).toLocaleString() : "0",
        memo: txResult.memo,
        status: "orphan" as const,
      },
    })
  } catch (error) {
    console.error("Recovery error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to process recovery request" },
      { status: 500 }
    )
  }
}
