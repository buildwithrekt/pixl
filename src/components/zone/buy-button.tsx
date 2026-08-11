"use client"

import { useState, useEffect } from "react"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { calculateFees } from "@/lib/marketplace"

interface BuyButtonProps {
  zoneId: string
  zoneWallet: string
}

interface ListingData {
  id: string
  askingPrice: string
  floorPrice: string
  seller: string
  status: string
  expiresAt: string
}

export function BuyButton({ zoneId, zoneWallet }: BuyButtonProps) {
  const { signedAddress } = useWalletAuth()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner =
    signedAddress && signedAddress.toLowerCase() === zoneWallet.toLowerCase()

  // Fetch existing listing
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/marketplace/zone/${zoneId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.listing && data.listing.status === "ACTIVE") {
            setListing(data.listing)
          }
        }
      } catch {
        // No listing
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [zoneId])

  const handleBuy = async () => {
    if (!signedAddress || !listing) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          wallet: signedAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to buy")
      }

      // Refresh the page to show new ownership
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to buy")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || isOwner || !listing) return null

  const askingPrice = BigInt(listing.askingPrice)
  const { platformFee, sellerProceeds } = calculateFees(askingPrice)

  return (
    <>
      <Card variant="glow" className="p-4">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-lime rounded-full animate-pulse" />
            For Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Price</span>
            <Chip>{askingPrice.toLocaleString()} $BLOK</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Floor</span>
            <span className="text-sm text-gray-500">
              {BigInt(listing.floorPrice).toLocaleString()} $BLOK
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Expires</span>
            <span className="text-sm text-gray-500">
              {new Date(listing.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <Button className="w-full" onClick={() => setShowModal(true)}>
            Buy now
          </Button>
        </CardContent>
      </Card>

      {/* Buy confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <Card variant="glow" className="w-full max-w-md p-6 border-lime">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white">Confirm purchase</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="font-mono font-medium text-white">
                    {askingPrice.toLocaleString()} $BLOK
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Platform fee (5%)</span>
                  <span className="font-mono text-sm text-gray-500">
                    {platformFee.toLocaleString()} $BLOK
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Seller receives</span>
                  <span className="font-mono text-sm text-gray-500">
                    {sellerProceeds.toLocaleString()} $BLOK
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-700" />

              <p className="text-sm text-gray-400">
                You will become the owner of this zone and can update its artwork or resell it.
              </p>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBuy}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Confirm purchase"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
