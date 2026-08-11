import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"

interface ZoneCardProps {
  zone: {
    id: string
    x: number
    y: number
    w: number
    h: number
    wallet: string
    status: string
    totalPixels: number
    imageUrl: string | null
    projectName: string | null
    paidAt: Date | string | null
  }
  shadow?: "red" | "blue" | "yellow"
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const pixelWidth = zone.w * 8
  const pixelHeight = zone.h * 8

  return (
    <Link href={`/zone/${zone.id}`} className="block group">
      <Card variant="glow" className="overflow-hidden">
        {/* Image preview */}
        <div className="aspect-square bg-gray-800 relative">
          {zone.imageUrl ? (
            <img
              src={zone.imageUrl}
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

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-mono text-[10px] text-lime uppercase">
              View zone →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray-500">
              {pixelWidth}×{pixelHeight} px
            </span>
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

          {zone.projectName && (
            <p className="font-body font-medium mt-2 truncate text-white">
              {zone.projectName}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-1">
            {truncateAddress(zone.wallet)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
