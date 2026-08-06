import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse all claimed zones on PIXELBOARD. Filter by artwork status, sort by size or price.",
}
import { Eyebrow } from "@/components/ui/eyebrow"
import { Chip } from "@/components/ui/chip"
import { ZoneCard } from "@/components/gallery/zone-card"
import { Pagination } from "@/components/gallery/pagination"
import { prisma } from "@/lib/prisma"

const PER_PAGE = 24

interface GalleryPageProps {
  searchParams: Promise<{
    status?: string
    sort?: string
    page?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams
  const status = params.status || "all"
  const sort = params.sort || "recent"
  const page = parseInt(params.page || "1", 10)

  // Mock data if no database
  if (!prisma) {
    return (
      <main className="min-h-screen bg-paper">
        <Nav />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Eyebrow className="mb-4">GALLERY</Eyebrow>
          <h1 className="font-display text-display-xl text-ink">
            Claimed Zones
          </h1>
          <p className="text-ink/60 mt-4">
            Connect database to view gallery.
          </p>
        </div>
      </main>
    )
  }

  // Build where clause
  const whereStatus =
    status === "all"
      ? { in: ["PAID", "DRAWN"] as const }
      : status === "drawn"
      ? "DRAWN"
      : status === "paid"
      ? "PAID"
      : { in: ["PAID", "DRAWN"] as const }

  // Fetch zones
  const [zones, totalCount] = await Promise.all([
    prisma.zone.findMany({
      where: { status: whereStatus },
      orderBy:
        sort === "recent"
          ? { paidAt: "desc" }
          : sort === "size"
          ? { totalPixels: "desc" }
          : { totalPrice: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: {
        id: true,
        x: true,
        y: true,
        w: true,
        h: true,
        wallet: true,
        status: true,
        totalPixels: true,
        imageUrl: true,
        projectName: true,
        paidAt: true,
      },
    }),
    prisma.zone.count({
      where: { status: whereStatus },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  const shadows = ["red", "blue", "yellow"] as const

  return (
    <main className="min-h-screen bg-paper">
      <Nav />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <Eyebrow className="mb-4">GALLERY</Eyebrow>
        <h1 className="font-display text-display-xl text-ink">Claimed Zones</h1>
        <p className="text-ink/70 mt-2">
          {totalCount.toLocaleString()} zones claimed on the board
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-8">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Link
              href={`/gallery?status=all&sort=${sort}`}
              className={`px-3 py-1.5 rounded-lg border-2 font-pixel text-[10px] uppercase transition-colors ${
                status === "all"
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink border-ink/30 hover:border-ink"
              }`}
            >
              All
            </Link>
            <Link
              href={`/gallery?status=drawn&sort=${sort}`}
              className={`px-3 py-1.5 rounded-lg border-2 font-pixel text-[10px] uppercase transition-colors ${
                status === "drawn"
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink border-ink/30 hover:border-ink"
              }`}
            >
              With artwork
            </Link>
            <Link
              href={`/gallery?status=paid&sort=${sort}`}
              className={`px-3 py-1.5 rounded-lg border-2 font-pixel text-[10px] uppercase transition-colors ${
                status === "paid"
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink border-ink/30 hover:border-ink"
              }`}
            >
              Awaiting artwork
            </Link>
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <span className="font-pixel text-[10px] text-ink/60 uppercase">
              Sort:
            </span>
            <Link
              href={`/gallery?status=${status}&sort=recent`}
              className={`px-2 py-1 text-sm ${
                sort === "recent" ? "text-ink font-medium" : "text-ink/60 hover:text-ink"
              }`}
            >
              Recent
            </Link>
            <Link
              href={`/gallery?status=${status}&sort=size`}
              className={`px-2 py-1 text-sm ${
                sort === "size" ? "text-ink font-medium" : "text-ink/60 hover:text-ink"
              }`}
            >
              Largest
            </Link>
            <Link
              href={`/gallery?status=${status}&sort=price`}
              className={`px-2 py-1 text-sm ${
                sort === "price" ? "text-ink font-medium" : "text-ink/60 hover:text-ink"
              }`}
            >
              Highest price
            </Link>
          </div>
        </div>

        {/* Grid */}
        {zones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {zones.map((zone: typeof zones[number], i: number) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                shadow={shadows[i % shadows.length]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-pixel text-ink/40 uppercase">No zones found</p>
            <p className="text-ink/60 mt-2">
              Be the first to{" "}
              <Link href="/board" className="text-blue hover:underline">
                claim a zone
              </Link>
              !
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/gallery"
          searchParams={{ status, sort }}
        />
      </div>

      <Footer />
    </main>
  )
}
