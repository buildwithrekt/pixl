"use client"

import { useState, useCallback } from "react"
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal"
import { ConfirmStep } from "./steps/confirm-step"
import { UploadStep } from "./steps/upload-step"
import { PayStep } from "./steps/pay-step"
import { SuccessStep } from "./steps/success-step"
import { usePayment } from "@/hooks/use-payment"
import { useWalletAuth } from "@/hooks/use-wallet-auth"

type FlowStep = "confirm" | "upload" | "pay" | "success"

interface Selection {
  x: number
  y: number
  w: number
  h: number
}

interface Pricing {
  tier: number
  pricePerPixel: number
  totalPixels: number
  totalPrice: bigint
}

interface Reservation {
  id: string
  reservationId: string
  expiresAt: string
  totalPrice: bigint
}

interface PaymentFlowModalProps {
  isOpen: boolean
  onClose: () => void
  selection: Selection | null
  pricing: Pricing | null
  wallet: string | undefined
}

const STEP_TITLES: Record<FlowStep, string> = {
  confirm: "Confirm your zone",
  upload: "Upload artwork",
  pay: "Complete payment",
  success: "Success!",
}

export function PaymentFlowModal({
  isOpen,
  onClose,
  selection,
  pricing,
  wallet,
}: PaymentFlowModalProps) {
  const [step, setStep] = useState<FlowStep>("confirm")
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null)

  const { pay, status: paymentStatus, txHash, error, reset } = usePayment()
  const { isDemoMode } = useWalletAuth()

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setStep("confirm")
    setReservation(null)
    setIsReserving(false)
    setIsUploading(false)
    setConfirmedTxHash(null)
    reset()
    onClose()
  }, [onClose, reset])

  // Step 1: Reserve zone
  const handleReserve = useCallback(async () => {
    if (!selection || !pricing || !wallet) return

    setIsReserving(true)

    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: selection.x,
          y: selection.y,
          w: selection.w,
          h: selection.h,
          wallet,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reserve zone")
      }

      const data = await response.json()

      setReservation({
        id: data.zone.id,
        reservationId: data.reservationId,
        expiresAt: data.expiresAt,
        totalPrice: BigInt(data.pricing.totalPrice),
      })

      setStep("upload")
    } catch (error) {
      console.error("Reserve error:", error)
      alert(error instanceof Error ? error.message : "Failed to reserve zone")
    } finally {
      setIsReserving(false)
    }
  }, [selection, pricing, wallet])

  // Step 2: Upload image
  const handleUpload = useCallback(
    async (file: File) => {
      if (!reservation || !wallet) return

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("zoneId", reservation.id)
        formData.append("wallet", wallet)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to upload image")
        }

        setStep("pay")
      } catch (error) {
        console.error("Upload error:", error)
        alert(error instanceof Error ? error.message : "Failed to upload image")
      } finally {
        setIsUploading(false)
      }
    },
    [reservation, wallet]
  )

  const handleSkipUpload = useCallback(() => {
    setStep("pay")
  }, [])

  // Step 3: Pay
  const handlePay = useCallback(async () => {
    if (!reservation) return

    // Demo mode: simulate payment
    if (isDemoMode) {
      try {
        const response = await fetch("/api/demo/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zoneId: reservation.id,
            reservationId: reservation.reservationId,
          }),
        })

        if (!response.ok) {
          throw new Error("Demo payment failed")
        }

        setConfirmedTxHash("DEMO_TX_" + Date.now())
        setStep("success")
      } catch (error) {
        console.error("Demo payment error:", error)
        alert("Demo payment failed")
      }
      return
    }

    // Real payment
    const hash = await pay(reservation.totalPrice, reservation.reservationId)

    if (hash) {
      setConfirmedTxHash(hash)
      // Wait a bit for webhook to process, then show success
      setTimeout(() => {
        setStep("success")
      }, 3000)
    }
  }, [reservation, pay, isDemoMode])

  if (!selection || !pricing) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Header with step indicator */}
      <ModalHeader>
        <div className="flex items-center gap-4">
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {(["confirm", "upload", "pay", "success"] as FlowStep[]).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-pixel text-[10px] ${
                      step === s
                        ? "border-ink bg-yellow text-ink"
                        : (["confirm", "upload", "pay", "success"] as FlowStep[]).indexOf(
                            step
                          ) > i
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/30 text-ink/30"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-4 h-0.5 ${
                        (["confirm", "upload", "pay", "success"] as FlowStep[]).indexOf(
                          step
                        ) > i
                          ? "bg-ink"
                          : "bg-ink/20"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <h2 className="font-display text-lg font-bold mt-4">
          {STEP_TITLES[step]}
        </h2>
      </ModalHeader>

      <ModalBody>
        {step === "confirm" && (
          <ConfirmStep
            selection={selection}
            pricing={pricing}
            onConfirm={handleReserve}
            isLoading={isReserving}
          />
        )}

        {step === "upload" && (
          <UploadStep
            zoneSize={{ w: selection.w * 8, h: selection.h * 8 }}
            onUpload={handleUpload}
            onSkip={handleSkipUpload}
            isUploading={isUploading}
          />
        )}

        {step === "pay" && reservation && (
          <PayStep
            reservation={reservation}
            onPay={handlePay}
            isPaying={paymentStatus === "pending" || paymentStatus === "confirming"}
            txHash={txHash}
            paymentStatus={paymentStatus}
            error={error}
          />
        )}

        {step === "success" && reservation && confirmedTxHash && (
          <SuccessStep
            zoneId={reservation.id}
            txHash={confirmedTxHash}
            onClose={handleClose}
          />
        )}
      </ModalBody>
    </Modal>
  )
}
