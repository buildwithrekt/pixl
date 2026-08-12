"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { useCountdown, formatCountdown } from "@/hooks/use-countdown"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

interface PayStepProps {
  reservation: {
    id: string
    reservationId: string
    expiresAt: string
    totalPrice: bigint
  }
  onPay: () => void
  isPaying: boolean
  txHash: string | null
  paymentStatus: "idle" | "pending" | "confirming" | "success" | "error"
  error: string | null
}

export function PayStep({
  reservation,
  onPay,
  isPaying,
  txHash,
  paymentStatus,
  error,
}: PayStepProps) {
  const { minutes, seconds, isExpired, isUrgent } = useCountdown(
    reservation.expiresAt
  )

  const explorerUrl = txHash
    ? `https://robinhoodchain.blockscout.com/tx/${txHash}`
    : null

  return (
    <div className="space-y-6">
      {/* TTL Countdown */}
      <div
        className={`p-4 text-center rounded-[4px] border ${
          isUrgent ? "bg-red-500/10 border-red-500" : "bg-gray-800 border-gray-700"
        }`}
      >
        <span className="font-mono text-[10px] text-gray-500 uppercase">
          Reservation expires in
        </span>
        <div
          className={`font-mono text-4xl mt-2 ${
            isUrgent ? "text-red-500" : "text-lime"
          } ${isExpired ? "animate-pulse" : ""}`}
        >
          {isExpired ? "EXPIRED" : formatCountdown(minutes, seconds)}
        </div>
        {isUrgent && !isExpired && (
          <p className="text-sm text-red-500 mt-2">Hurry! Time is running out.</p>
        )}
      </div>

      {/* Amount to pay */}
      <div className="bg-lime/10 border border-lime/30 rounded-[4px] p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm flex items-center gap-2 text-lime">
            Amount to pay
            <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center">
            <span className="font-display text-3xl font-bold text-white">
              {Number(reservation.totalPrice).toLocaleString()}
            </span>
            <span className="font-mono text-lg ml-2 text-lime">$BLOKR</span>
          </div>
        </CardContent>
      </div>

      {/* Transaction status */}
      {paymentStatus !== "idle" && (
        <div
          className={`p-4 rounded-[4px] border ${
            paymentStatus === "error" ? "bg-red-500/10 border-red-500" : "bg-gray-800 border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentStatus === "pending" && (
              <>
                <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-white">Waiting for signature...</span>
              </>
            )}
            {paymentStatus === "confirming" && (
              <>
                <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-white">Confirming transaction...</span>
              </>
            )}
            {paymentStatus === "error" && (
              <>
                <span className="text-red-500 font-bold">!</span>
                <span className="text-sm text-red-500">{error}</span>
              </>
            )}
          </div>

          {txHash && (
            <a
              href={explorerUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-sm text-lime hover:underline truncate"
            >
              View on explorer: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          )}
        </div>
      )}

      {/* Pay button */}
      <Button
        size="lg"
        className="w-full"
        onClick={onPay}
        disabled={isPaying || isExpired}
      >
        {isPaying ? (
          "Processing..."
        ) : isExpired ? (
          "Reservation expired"
        ) : (
          <>
            Pay {Number(reservation.totalPrice).toLocaleString()} $BLOKR
          </>
        )}
      </Button>

      {/* Note */}
      <p className="text-xs text-gray-500 text-center">
        Payment is sent to the treasury and burned every 24h. Your zone will
        appear on the canvas immediately after confirmation.
      </p>
    </div>
  )
}
