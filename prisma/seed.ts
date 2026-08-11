import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL not set")
}

const pool = new Pool({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create initial price state singleton
  await prisma.priceState.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      pixelsSold: 0,
      currentTier: 1,
      basePrice: 150, // 150 $BLOK per pixel base price
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
