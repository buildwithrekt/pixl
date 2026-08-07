import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blok.art"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/board`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blok`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Dynamic zone pages
  let zonePages: MetadataRoute.Sitemap = []

  if (prisma) {
    try {
      const zones = await prisma.zone.findMany({
        where: {
          status: { in: ["PAID", "DRAWN"] },
        },
        select: {
          id: true,
          paidAt: true,
        },
        orderBy: {
          paidAt: "desc",
        },
      })

      zonePages = zones.map((zone: { id: string; paidAt: Date | null }) => ({
        url: `${baseUrl}/zone/${zone.id}`,
        lastModified: zone.paidAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }))
    } catch {
      // Database not available, skip zone pages
    }
  }

  return [...staticPages, ...zonePages]
}
