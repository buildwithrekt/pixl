"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { Select, SelectOption } from "@/components/ui/select"
import { SearchInput } from "@/components/gallery/search-input"

interface Zone {
  id: string
  x: number
  y: number
  w: number
  h: number
  status: string
  wallet: string
  projectName: string | null
  imageUrl: string | null
  originalImageUrl: string | null
  totalPixels: number
  totalPrice: string
  paidAt: string | null
}

type SortOption = "newest" | "oldest" | "largest" | "smallest"
type StatusFilter = "all" | "DRAWN" | "PAID"

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function GalleryPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Fetch zones
  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch("/api/gallery")
        if (res.ok) {
          const data = await res.json()
          setZones(data.zones || [])
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchZones()
  }, [])

  // Filter and sort zones
  const filteredZones = useMemo(() => {
    let result = [...zones]

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((z) => z.status === statusFilter)
    }

    // Filter by search (address or project name)
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (z) =>
          z.wallet.toLowerCase().includes(searchLower) ||
          z.projectName?.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          if (!a.paidAt) return 1
          if (!b.paidAt) return -1
          return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        })
        break
      case "oldest":
        result.sort((a, b) => {
          if (!a.paidAt) return 1
          if (!b.paidAt) return -1
          return new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
        })
        break
      case "largest":
        result.sort((a, b) => b.totalPixels - a.totalPixels)
        break
      case "smallest":
        result.sort((a, b) => a.totalPixels - b.totalPixels)
        break
    }

    return result
  }, [zones, search, sortBy, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const drawn = zones.filter((z) => z.status === "DRAWN").length
    const paid = zones.filter((z) => z.status === "PAID").length
    const totalPixels = zones.reduce((sum, z) => sum + z.totalPixels, 0)
    const uniqueOwners = new Set(zones.map((z) => z.wallet.toLowerCase())).size
    return { drawn, paid, total: zones.length, totalPixels, uniqueOwners }
  }, [zones])

  return (
    <main className="min-h-screen bg-black">
      <Nav />

      {/* Header */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <span className="font-mono text-[11px] text-lime border border-lime px-3 py-1 rounded-[4px] uppercase">
          Explore
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
          Gallery
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Browse all claimed zones on the canvas. Search by wallet address or
          project name.
        </p>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3">
          <Chip>{stats.total} zones</Chip>
          <Chip variant="info">{stats.drawn} with artwork</Chip>
          <Chip variant="secondary">
            {stats.totalPixels.toLocaleString()} pixels
          </Chip>
          <Chip variant="secondary">{stats.uniqueOwners} owners</Chip>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by wallet or project name..."
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "DRAWN" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("DRAWN")}
            >
              With art
            </Button>
            <Button
              variant={statusFilter === "PAID" ? "default" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("PAID")}
            >
              No art yet
            </Button>
          </div>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <SelectOption value="newest">Newest first</SelectOption>
            <SelectOption value="oldest">Oldest first</SelectOption>
            <SelectOption value="largest">Largest first</SelectOption>
            <SelectOption value="smallest">Smallest first</SelectOption>
          </Select>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 pb-16 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-gray-500 uppercase">
              {search ? "No zones found" : "No zones yet"}
            </p>
            {search && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredZones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

function ZoneCard({ zone }: { zone: Zone }) {
  return (
    <Link href={`/zone/${zone.id}`}>
      <Card variant="glow" className="overflow-hidden group cursor-pointer">
        {/* Image */}
        <div
          className="border-b border-gray-700 bg-gray-800 relative"
          style={{ aspectRatio: "1/1" }}
        >
          {(zone.originalImageUrl || zone.imageUrl) ? (
            <img
              src={zone.originalImageUrl || zone.imageUrl || ""}
              alt={zone.projectName || "Zone artwork"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-mono text-[10px] text-gray-600 uppercase">
                No artwork
              </span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 right-2">
            <Chip
              variant={zone.status === "DRAWN" ? "default" : "secondary"}
              className="text-[9px]"
            >
              {zone.status === "DRAWN" ? "ART" : "CLAIMED"}
            </Chip>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-bold text-lg text-white leading-tight group-hover:text-lime transition-colors truncate">
            {zone.projectName || `Zone (${zone.x}, ${zone.y})`}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[10px] text-gray-500">
              {zone.totalPixels.toLocaleString()} px
            </span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-[10px] text-gray-500">
              {zone.w}×{zone.h} cells
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-2 truncate">
            {truncateAddress(zone.wallet)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
