"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"
import Link from "next/link"

interface SuccessStepProps {
  zoneId: string
  txHash: string
  onClose: () => void
}

export function SuccessStep({ zoneId, txHash, onClose }: SuccessStepProps) {
  const explorerUrl = `https://robinhoodchain.blockscout.com/tx/${txHash}`

  return (
    <div className="space-y-6 text-center">
      {/* Celebration */}
      <div className="py-4">
        <div className="flex items-center justify-center gap-2">
          <Sprite map={SPRITE_MAPS.fire} pixelSize={8} />
          <Sprite map={SPRITE_MAPS.fire} pixelSize={10} />
          <Sprite map={SPRITE_MAPS.fire} pixelSize={8} />
        </div>
      </div>

      {/* Success message */}
      <div>
        <h3 className="font-display text-2xl font-bold text-lime">
          Pixels claimed!
        </h3>
        <p className="text-gray-400 mt-2">
          Your zone is now part of the BLOKR forever.
        </p>
      </div>

      {/* Zone info */}
      <div className="bg-gray-800 border border-gray-700 rounded-[4px] p-4 inline-block">
        <span className="font-mono text-[10px] text-gray-500 uppercase">
          Zone ID
        </span>
        <p className="font-mono text-sm mt-1 text-white">{zoneId}</p>
      </div>

      {/* Transaction link */}
      <div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-lime hover:underline"
        >
          <Chip variant="secondary">View transaction</Chip>
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button asChild>
          <Link href={`/zone/${zoneId}`}>View your zone</Link>
        </Button>

        <Button variant="secondary" onClick={onClose}>
          Claim another zone
        </Button>
      </div>

      {/* Share prompt */}
      <p className="text-sm text-gray-500 pt-4">
        Share your zone on X and tag{" "}
        <span className="font-mono text-lime">@BLOKR</span>
      </p>
    </div>
  )
}
