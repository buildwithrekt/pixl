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
      <Card
        shadow={isUrgent ? "red" : "blue"}
        className={`p-4 text-center ${isUrgent ? "bg-red/10" : ""}`}
      >
        <span className="font-pixel text-[10px] text-ink/60 uppercase">
          Reservation expires in
        </span>
        <div
          className={`font-pixel text-4xl mt-2 ${
            isUrgent ? "text-red" : "text-ink"
          } ${isExpired ? "animate-pulse" : ""}`}
        >
          {isExpired ? "EXPIRED" : formatCountdown(minutes, seconds)}
        </div>
        {isUrgent && !isExpired && (
          <p className="text-sm text-red mt-2">Hurry! Time is running out.</p>
        )}
      </Card>

      {/* Amount to pay */}
      <Card shadow="yellow" className="p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            Amount to pay
            <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center">
            <span className="font-display text-3xl font-bold">
              {Number(reservation.totalPrice).toLocaleString()}
            </span>
            <span className="font-pixel text-lg ml-2">$PIXEL</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction status */}
      {paymentStatus !== "idle" && (
        <Card
          shadow={paymentStatus === "error" ? "red" : "blue"}
          className="p-4"
        >
          <div className="flex items-center gap-3">
            {paymentStatus === "pending" && (
              <>
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Waiting for signature...</span>
              </>
            )}
            {paymentStatus === "confirming" && (
              <>
                <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Confirming transaction...</span>
              </>
            )}
            {paymentStatus === "error" && (
              <>
                <span className="text-red font-bold">!</span>
                <span className="text-sm text-red">{error}</span>
              </>
            )}
          </div>

          {txHash && (
            <a
              href={explorerUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-sm text-blue hover:underline truncate"
            >
              View on explorer: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          )}
        </Card>
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
            Pay {Number(reservation.totalPrice).toLocaleString()} $PIXEL
          </>
        )}
      </Button>

      {/* Note */}
      <p className="text-xs text-ink/50 text-center">
        Payment is sent to the treasury and burned every 24h. Your zone will
        appear on the canvas immediately after confirmation.
      </p>
    </div>
  )
}
