import { inngest } from "./inngest"
import { prisma } from "./prisma"
import { updateComposite } from "./composite"
import { getTierForPixelsSold, getMultiplierForTier } from "./pricing"

// 1. Expire old reservations (runs every minute)
export const expireReservationsFunction = inngest.createFunction(
  { id: "expire-reservations" },
  { cron: "* * * * *" },
  async ({ step }) => {
    if (!prisma) {
      return { error: "Database not configured" }
    }

    const result = await step.run("expire-old-reservations", async () => {
      // Find and update expired reservations
      const expired = await prisma!.zone.updateMany({
        where: {
          status: "RESERVED",
          expiresAt: { lt: new Date() },
        },
        data: {
          status: "EXPIRED",
        },
      })

      if (expired.count > 0) {
        // Log events for expired zones
        const expiredZones = await prisma!.zone.findMany({
          where: { status: "EXPIRED" },
          orderBy: { updatedAt: "desc" },
          take: expired.count,
        })

        for (const zone of expiredZones) {
          await prisma!.event.create({
            data: {
              type: "ZONE_EXPIRED",
              zoneId: zone.id,
              wallet: zone.wallet,
              data: {
                reservationId: zone.reservationId,
                expiresAt: zone.expiresAt?.toISOString(),
              },
            },
          })
        }
      }

      return { expiredCount: expired.count }
    })

    return result
  }
)

// 2. Regenerate composite when zone is drawn
export const regenerateCompositeFunction = inngest.createFunction(
  { id: "regenerate-composite" },
  { event: "zone/drawn" },
  async ({ event, step }) => {
    const result = await step.run("regenerate", async () => {
      const url = await updateComposite()
      return { compositeUrl: url, zoneId: event.data.zoneId }
    })

    return result
  }
)

// 3. Check and update price tier when zone is paid
export const checkPriceTierFunction = inngest.createFunction(
  { id: "check-price-tier" },
  { event: "zone/paid" },
  async ({ step }) => {
    if (!prisma) {
      return { error: "Database not configured" }
    }

    const result = await step.run("check-tier", async () => {
      const priceState = await prisma!.priceState.findUnique({
        where: { id: "singleton" },
      })

      if (!priceState) {
        return { error: "PriceState not found" }
      }

      const newTier = getTierForPixelsSold(priceState.pixelsSold)

      if (newTier !== priceState.currentTier) {
        const newMultiplier = getMultiplierForTier(newTier)
        const newPrice = priceState.basePrice * newMultiplier

        // Update price state
        const existingHistory = Array.isArray(priceState.history) ? priceState.history : []
        const newHistory = [
          ...existingHistory,
          {
            tier: Number(newTier),
            price: Number(newPrice),
            timestamp: new Date().toISOString(),
            pixelsSold: Number(priceState.pixelsSold),
          },
        ]

        await prisma!.priceState.update({
          where: { id: "singleton" },
          data: {
            currentTier: newTier,
            history: newHistory,
          },
        })

        // Log tier change event
        await prisma!.event.create({
          data: {
            type: "PRICE_TIER_CHANGE",
            data: {
              oldTier: priceState.currentTier,
              newTier,
              oldPrice: priceState.basePrice * getMultiplierForTier(priceState.currentTier),
              newPrice,
              pixelsSold: priceState.pixelsSold,
            },
          },
        })

        return { tierChanged: true, oldTier: priceState.currentTier, newTier }
      }

      return { tierChanged: false, currentTier: priceState.currentTier }
    })

    return result
  }
)
