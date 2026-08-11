"use client"

import { useState, useEffect } from "react"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"

interface SellButtonProps {
  zoneId: string
  zoneWallet: string
  zoneTotalPrice: bigint
  zonePurchaseTier: number | null
}

interface ListingData {
  id: string
  askingPrice: string
  floorPrice: string
  status: string
  expiresAt: string
}

export function SellButton({
  zoneId,
  zoneWallet,
  zoneTotalPrice,
  zonePurchaseTier,
}: SellButtonProps) {
  const { signedAddress } = useWalletAuth()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [askingPrice, setAskingPrice] = useState("")
  const [floorPrice, setFloorPrice] = useState<bigint>(BigInt(0))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner =
    signedAddress && signedAddress.toLowerCase() === zoneWallet.toLowerCase()

  // Fetch existing listing
  useEffect(() => {
    async function fetchListing() {
      try {
        // We'll check if zone has a listing via a simple API call
        const res = await fetch(`/api/marketplace/zone/${zoneId}`)
        if (res.ok) {
          const data = await res.json()
          setListing(data.listing)
          setFloorPrice(BigInt(data.floorPrice || "0"))
        }
      } catch {
        // No listing
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [zoneId])

  const handleList = async () => {
    if (!signedAddress) return

    const priceValue = BigInt(askingPrice.replace(/[^0-9]/g, ""))
    if (priceValue < floorPrice) {
      setError(`Price must be at least ${floorPrice.toLocaleString()} $BLOK`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/marketplace/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          askingPrice: priceValue.toString(),
          wallet: signedAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to list")
      }

      setListing({
        id: data.listing.id,
        askingPrice: data.listing.askingPrice,
        floorPrice: data.listing.floorPrice,
        status: "ACTIVE",
        expiresAt: data.listing.expiresAt,
      })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!signedAddress || !listing) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/marketplace/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          wallet: signedAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel")
      }

      setListing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOwner || loading) return null

  // Currently listed
  if (listing && listing.status === "ACTIVE") {
    return (
      <Card variant="glow" className="p-4">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-lime rounded-full animate-pulse" />
            Listed on Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Asking price</span>
            <Chip>{BigInt(listing.askingPrice).toLocaleString()} $BLOK</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Floor price</span>
            <span className="text-sm text-white">
              {BigInt(listing.floorPrice).toLocaleString()} $BLOK
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Expires</span>
            <span className="text-sm text-gray-500">
              {new Date(listing.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCancel}
            disabled={submitting}
          >
            {submitting ? "Cancelling..." : "Cancel listing"}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  // Not listed - show sell button
  return (
    <>
      <Card variant="glow" className="p-4">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm text-white">Sell this zone</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <p className="text-sm text-gray-400">
            List your zone on the marketplace. Floor price increases as tiers advance.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Est. floor</span>
            <span className="text-sm font-medium text-white">
              {floorPrice.toLocaleString()} $BLOK
            </span>
          </div>
          <Button className="w-full" onClick={() => setShowModal(true)}>
            List for sale
          </Button>
        </CardContent>
      </Card>

      {/* List modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <Card variant="glow" className="w-full max-w-md p-6 border-lime">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white">List zone for sale</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <label className="font-mono text-[10px] text-gray-500 uppercase block mb-2">
                  Floor price (minimum)
                </label>
                <p className="font-mono text-lg text-white">
                  {floorPrice.toLocaleString()} $BLOK
                </p>
              </div>

              <div>
                <label className="font-mono text-[10px] text-gray-500 uppercase block mb-2">
                  Your asking price
                </label>
                <input
                  type="text"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder={floorPrice.toString()}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-[4px] font-mono text-white focus:outline-none focus:border-lime focus:shadow-[0_0_0_3px_rgba(204,253,3,0.15)]"
                />
              </div>

              <div className="bg-lime/10 border border-lime/30 rounded-[4px] p-3">
                <p className="font-mono text-[10px] text-lime uppercase mb-1">
                  Platform fee: 5%
                </p>
                <p className="text-sm text-gray-400">
                  You receive 95% of the sale price when sold.
                </p>
              </div>

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
                  onClick={handleList}
                  disabled={submitting || !askingPrice}
                >
                  {submitting ? "Listing..." : "Confirm listing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
