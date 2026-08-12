import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { ShareButtons } from "@/components/zone/share-buttons"
import { ZoneEditImage } from "@/components/zone/zone-edit-image"
import { SellButton } from "@/components/zone/sell-button"
import { BuyButton } from "@/components/zone/buy-button"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  if (!prisma) {
    return { title: "Zone" }
  }

  const zone = await prisma.zone.findUnique({
    where: { id },
    select: { x: true, y: true, w: true, h: true, projectName: true },
  })

  if (!zone) {
    return { title: "Zone Not Found" }
  }

  const name = zone.projectName || `Zone at (${zone.x}, ${zone.y})`
  const pixels = zone.w * zone.h * 64

  return {
    title: name,
    description: `${name} - ${pixels.toLocaleString()} pixels claimed on BLOKR.`,
  }
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatNumber(num: number | bigint): string {
  return num.toLocaleString()
}

interface ZonePageProps {
  params: Promise<{ id: string }>
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { id } = await params

  if (!prisma) {
    return (
      <main className="min-h-screen bg-black">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-500">Database not configured</p>
        </div>
      </main>
    )
  }

  const zone = await prisma.zone.findUnique({
    where: { id },
  })

  if (!zone) {
    notFound()
  }

  const explorerUrl = zone.txSignature
    ? `https://robinhoodchain.blockscout.com/tx/${zone.txSignature}`
    : null

  const pixelWidth = zone.w * 8
  const pixelHeight = zone.h * 8

  return (
    <main className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <Link
          href="/board"
          className="inline-flex items-center gap-2 text-lime hover:underline mb-8"
        >
          <span>←</span>
          <span>Back to board</span>
        </Link>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image */}
          <Card variant="glow" className="p-6">
            <div
              className="border border-gray-700 rounded-[4px] overflow-hidden bg-gray-800"
              style={{ aspectRatio: `${zone.w}/${zone.h}` }}
            >
              {(zone.originalImageUrl || zone.imageUrl) ? (
                <img
                  src={zone.originalImageUrl || zone.imageUrl || ""}
                  alt={zone.projectName || "Zone artwork"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center min-h-[200px]">
                  <span className="font-mono text-[10px] text-gray-600 uppercase">
                    No artwork yet
                  </span>
                </div>
              )}
            </div>

            {zone.projectName && (
              <h1 className="font-display text-xl font-bold text-white mt-4">
                {zone.projectName}
              </h1>
            )}

            {zone.projectLink && (
              <a
                href={zone.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:underline text-sm mt-2 block"
              >
                {zone.projectLink}
              </a>
            )}
          </Card>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Zone ID */}
            <Card variant="glow" className="p-4">
              <span className="font-mono text-[10px] text-gray-500 uppercase">
                Zone ID
              </span>
              <p className="font-mono text-sm text-white mt-1 break-all">{zone.id}</p>
            </Card>

            {/* Details */}
            <Card variant="glow" className="p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm text-white">Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <Chip
                    variant={
                      zone.status === "DRAWN"
                        ? "default"
                        : zone.status === "PAID"
                        ? "secondary"
                        : "muted"
                    }
                  >
                    {zone.status}
                  </Chip>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Position</span>
                  <span className="font-mono text-sm text-white">
                    ({zone.x}, {zone.y})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Size</span>
                  <span className="text-sm text-white">
                    {zone.w}×{zone.h} cells ({pixelWidth}×{pixelHeight} px)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total pixels</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(zone.totalPixels)}
                  </span>
                </div>

                <div className="h-px bg-gray-700" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Price paid</span>
                  <Chip>{formatNumber(zone.totalPrice)} $BLOKR</Chip>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tier at purchase</span>
                  <span className="font-mono text-sm text-white">
                    {zone.pricePerPixel} $BLOKR/px
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Owner */}
            <Card variant="glow" className="p-4">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-sm text-white">Owner</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="font-mono text-sm text-white break-all">{zone.wallet}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Claimed{" "}
                  {zone.paidAt
                    ? new Date(zone.paidAt).toLocaleDateString()
                    : "—"}
                </p>
              </CardContent>
            </Card>

            {/* Edit image (only visible to owner) */}
            {(zone.status === "PAID" || zone.status === "DRAWN") && (
              <ZoneEditImage
                zoneId={zone.id}
                zoneWallet={zone.wallet}
                zoneSize={{ w: zone.w, h: zone.h }}
                hasImage={!!zone.imageUrl}
              />
            )}

            {/* Marketplace - Sell (owner) or Buy (non-owner) */}
            {(zone.status === "PAID" || zone.status === "DRAWN") && (
              <>
                <SellButton
                  zoneId={zone.id}
                  zoneWallet={zone.wallet}
                  zoneTotalPrice={zone.totalPrice}
                  zonePurchaseTier={zone.purchaseTier}
                />
                <BuyButton zoneId={zone.id} zoneWallet={zone.wallet} />
              </>
            )}

            {/* Transaction */}
            {explorerUrl && (
              <Button variant="secondary" className="w-full" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  View burn transaction ↗
                </a>
              </Button>
            )}

            {/* Share */}
            <ShareButtons title={zone.projectName || `Zone (${zone.x}, ${zone.y})`} />
          </div>
        </div>

        {/* Board preview placeholder */}
        <Card variant="glow" className="mt-12 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm text-white">Location on board</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-48 bg-gray-800 rounded-[4px] flex items-center justify-center border border-gray-700">
              <span className="font-mono text-[10px] text-gray-600 uppercase">
                Mini board preview coming soon
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Zone at position ({zone.x}, {zone.y}) • {zone.w}×{zone.h} cells
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
