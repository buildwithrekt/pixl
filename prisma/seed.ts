import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create initial price state singleton
  await prisma.priceState.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      pixelsSold: 0,
      currentTier: 1,
      basePrice: 150, // 150 $PIXEL per pixel base price
      history: [],
    },
  })

  console.log("Seed completed: PriceState singleton created")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
