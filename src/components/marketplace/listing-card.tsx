"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"

interface ListingCardProps {
  listing: {
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
  onBuy?: (listingId: string) => void
  isBuying?: boolean
  currentWallet?: string | null
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatPrice(price: string): string {
  return BigInt(price).toLocaleString()
}

export function ListingCard({
  listing,
  onBuy,
  isBuying,
  currentWallet,
}: ListingCardProps) {
  const isOwner =
    currentWallet?.toLowerCase() === listing.seller.toLowerCase()

  return (
    <Card variant="glow" className="overflow-hidden flex flex-col">
      {/* Zone image */}
      <Link href={`/zone/${listing.zone.id}`} className="block group">
        <div
          className="border-b border-gray-700 bg-gray-800"
          style={{ aspectRatio: "1/1" }}
        >
          {listing.zone.imageUrl ? (
            <img
              src={listing.zone.imageUrl}
              alt={listing.zone.projectName || "Zone artwork"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-mono text-[10px] text-gray-600 uppercase">
                No artwork
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Project name */}
        <Link href={`/zone/${listing.zone.id}`}>
          <h3 className="font-display font-bold text-lg text-white leading-tight hover:text-lime transition-colors">
            {listing.zone.projectName || `Zone (${listing.zone.x}, ${listing.zone.y})`}
          </h3>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-[10px] text-gray-500">
            {listing.zone.totalPixels.toLocaleString()} px
          </span>
          <span className="text-gray-600">•</span>
          <span className="font-mono text-[10px] text-gray-500">
            {listing.zone.w}×{listing.zone.h} cells
          </span>
        </div>

        {/* Seller */}
        <p className="text-xs text-gray-500 mt-2">
          by {truncateAddress(listing.seller)}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Price
            </span>
            <Chip>{formatPrice(listing.askingPrice)} $BLOKR</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray-500 uppercase">
              Floor
            </span>
            <span className="text-sm text-gray-400">
              {formatPrice(listing.floorPrice)} $BLOKR
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          {isOwner ? (
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/zone/${listing.zone.id}`}>Manage listing</Link>
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => onBuy?.(listing.id)}
              disabled={isBuying}
            >
              {isBuying ? "Buying..." : "Buy now"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
