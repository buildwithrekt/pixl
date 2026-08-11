"use client"

import { useEffect, useState, useCallback } from "react"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { Nav } from "@/components/nav"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/marketplace/listing-card"

interface Listing {
  id: string
  zone: {
    id: string
    x: number
    y: number
    w: number
    h: number
    imageUrl: string | null
    projectName: string | null
    totalPixels: number
    status: string
  }
  seller: string
  askingPrice: string
  floorPrice: string
  purchaseTier: number
  createdAt: string
  expiresAt: string
}

type SortOption = "recent" | "price_asc" | "price_desc" | "size"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "size", label: "Size: Largest first" },
]

const ITEMS_PER_PAGE = 12

export default function MarketplacePage() {
  const { signedAddress } = useWalletAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)

  // Filters
  const [sort, setSort] = useState<SortOption>("recent")
  const [offset, setOffset] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        sort,
        limit: String(ITEMS_PER_PAGE),
        offset: String(offset),
      })

      const res = await fetch(`/api/marketplace?${params}`)
      if (!res.ok) throw new Error("Failed to fetch listings")

      const data = await res.json()
      setListings(data.listings)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings")
    } finally {
      setLoading(false)
    }
  }, [sort, offset])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleBuy = async (listingId: string) => {
    if (!signedAddress) {
      alert("Please connect your wallet first")
      return
    }

    setBuyingId(listingId)

    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          wallet: signedAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to buy")
      }

      // Refresh listings
      fetchListings()
      alert("Purchase successful!")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to buy")
    } finally {
      setBuyingId(null)
    }
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setOffset(0) // Reset to first page
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1

  return (
    <main className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-lime border border-lime px-3 py-1 rounded-[4px] uppercase">
            Secondary market
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 text-white">
            Marketplace
          </h1>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Buy and sell zones. Early buyers get floor price appreciation as tiers increase.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="glow" className="p-4 text-center">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Active listings
            </span>
            <p className="font-display text-2xl font-bold mt-1 text-white">{total}</p>
          </Card>
          <Card variant="glow" className="p-4 text-center">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Platform fee
            </span>
            <p className="font-display text-2xl font-bold mt-1 text-lime">5%</p>
          </Card>
          <Card variant="glow" className="p-4 text-center">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Listing duration
            </span>
            <p className="font-display text-2xl font-bold mt-1 text-white">30 days</p>
          </Card>
          <Card variant="glow" className="p-4 text-center">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Min price
            </span>
            <p className="font-display text-2xl font-bold mt-1 text-white">Floor</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Sort by:
            </span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`font-mono text-[10px] px-3 py-1.5 border rounded-[4px] transition-all ${
                    sort === option.value
                      ? "bg-lime text-black border-lime"
                      : "bg-gray-900 text-gray-400 border-gray-700 hover:border-lime hover:text-lime"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Showing {listings.length} of {total} listings
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 mx-auto border-2 border-lime border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-[11px] text-gray-500 uppercase">
              Loading listings...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-white mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchListings}>
              Retry
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <Card variant="glow" className="p-12 text-center">
            <CardHeader className="p-0">
              <CardTitle className="text-lg text-lime">No listings yet</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2">
              <p className="text-gray-400">
                Be the first to list your zone on the marketplace!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onBuy={handleBuy}
                  isBuying={buyingId === listing.id}
                  currentWallet={signedAddress}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="secondary"
                  onClick={() => setOffset(Math.max(0, offset - ITEMS_PER_PAGE))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <span className="font-mono text-[11px] text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setOffset(offset + ITEMS_PER_PAGE)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
