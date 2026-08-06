// Prisma client singleton
// Run `npx prisma generate` after setting DATABASE_URL to generate the client

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClient: any

try {
  // Dynamic import to avoid build errors when client isn't generated
  PrismaClient = require("@prisma/client").PrismaClient
} catch {
  // Client not generated yet - will be available after `npx prisma generate`
  PrismaClient = null
}

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClient
    ? new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      })
    : null)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
