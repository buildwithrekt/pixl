import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Prisma } from "@prisma/client"
import { Pool } from "pg"

// Export transaction type for use in route handlers
export type PrismaTransactionClient = Prisma.TransactionClient

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn("DATABASE_URL not set, database features disabled")
    return null
  }

  const pool = new Pool({ connectionString })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}
