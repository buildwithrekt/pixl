"use client"

import { useEffect, useState } from "react"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { WalletButton } from "@/components/wallet/wallet-button"

interface Zone {
  id: string
  x: number
  y: number
  w: number
  h: number
  status: string
  imageUrl: string | null
  originalImageUrl: string | null
  projectName: string | null
  projectLink: string | null
  totalPixels: number
  totalPrice: string
  pricePerPixel: number
  createdAt: string
  paidAt: string | null
  listing: {
    id: string
    askingPrice: string
    floorPrice: string
    status: string
  } | null
}

export default function ProfilePage() {
  const { isSignedIn, signedAddress } = useWalletAuth()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!signedAddress) {
      setZones([])
      return
    }

    async function fetchZones() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/zones/by-wallet?wallet=${signedAddress}`
        )
        if (!res.ok) throw new Error("Failed to fetch zones")
        const data = await res.json()
        setZones(data.zones)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load zones")
      } finally {
        setLoading(false)
      }
    }

    fetchZones()
  }, [signedAddress])

  const totalPixels = zones.reduce((sum, z) => sum + z.totalPixels, 0)
  const totalSpent = zones.reduce((sum, z) => sum + BigInt(z.totalPrice), 0n)
  const listedCount = zones.filter((z) => z.listing).length

  return (
    <main className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-lime border border-lime px-3 py-1 rounded-[4px] uppercase">
            Profile
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 text-white">
            My Zones
          </h1>
        </div>

        {!isSignedIn ? (
          /* Not connected */
          <Card variant="glow" className="p-12 text-center max-w-md mx-auto">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lime">Connect your wallet</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-gray-400">
                Connect your wallet to see your claimed zones and manage your listings.
              </p>
              <WalletButton />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Wallet info */}
            <Card variant="glow" className="p-6 mb-8 border-lime">
              <div className="flex flex-col gap-4">
                {/* Wallet address + disconnect */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-500 uppercase">
                      Connected wallet
                    </span>
                    <p className="font-mono text-sm sm:text-lg mt-1 text-white">
                      {signedAddress}
                    </p>
                  </div>
                  <WalletButton />
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-6 pt-4 border-t border-gray-800">
                  <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-500 uppercase block">
                      Zones
                    </span>
                    <p className="font-display text-2xl font-bold text-white">
                      {zones.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-500 uppercase block">
                      Total pixels
                    </span>
                    <p className="font-display text-2xl font-bold text-white">
                      {totalPixels.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-500 uppercase block">
                      Spent
                    </span>
                    <p className="font-display text-2xl font-bold text-lime">
                      {totalSpent.toLocaleString()} $BLOK
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-500 uppercase block">
                      Listed
                    </span>
                    <p className="font-display text-2xl font-bold text-white">
                      {listedCount}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Zones */}
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 mx-auto border-2 border-lime border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-[11px] text-gray-500 uppercase">
                  Loading your zones...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-white">{error}</p>
              </div>
            ) : zones.length === 0 ? (
              <Card variant="glow" className="p-12 text-center">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lime">No zones yet</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <p className="text-gray-400">
                    You haven&apos;t claimed any zones on the board yet.
                  </p>
                  <Button asChild>
                    <Link href="/board">Claim your first zone</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones.map((zone) => (
                  <ZoneCard key={zone.id} zone={zone} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function ZoneCard({ zone }: { zone: Zone }) {
  return (
    <Card variant="interactive" className="overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/zone/${zone.id}`} className="block">
        <div
          className="border-b border-gray-700 bg-gray-900"
          style={{ aspectRatio: "1/1" }}
        >
          {(zone.originalImageUrl || zone.imageUrl) ? (
            <img
              src={zone.originalImageUrl || zone.imageUrl || ""}
              alt={zone.projectName || "Zone artwork"}
              className="w-full h-full object-cover"
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
        <div className="flex items-start justify-between gap-2">
          <Link href={`/zone/${zone.id}`}>
            <h3 className="font-display font-bold text-lg leading-tight text-white hover:text-lime transition-colors">
              {zone.projectName || `Zone (${zone.x}, ${zone.y})`}
            </h3>
          </Link>
          <Chip variant={zone.status === "DRAWN" ? "default" : "secondary"}>
            {zone.status}
          </Chip>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <span className="font-mono text-[10px]">
            {zone.totalPixels.toLocaleString()} px
          </span>
          <span>•</span>
          <span className="font-mono text-[10px]">
            {zone.w}×{zone.h} cells
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Listing status */}
        {zone.listing ? (
          <div className="mt-4 p-3 bg-lime/10 border border-lime/50 rounded-[4px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-gray-400 uppercase">
                Listed for
              </span>
              <span className="font-mono font-medium text-lime">
                {BigInt(zone.listing.askingPrice).toLocaleString()} $BLOK
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/zone/${zone.id}`}>Manage zone</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
