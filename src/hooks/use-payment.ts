"use client"

import { useCallback, useState, useEffect } from "react"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"
import { encodeTransferWithMemo, getPixelTokenAddress, getPublicTreasuryAddress } from "@/lib/evm"

interface PaymentState {
  status: "idle" | "pending" | "confirming" | "success" | "error"
  txHash: `0x${string}` | null
  error: string | null
}

export function usePayment() {
  const { address } = useAccount()
  const { sendTransactionAsync, isPending } = useSendTransaction()
  const [state, setState] = useState<PaymentState>({
    status: "idle",
    txHash: null,
    error: null,
  })

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: state.txHash ?? undefined,
  })

  // Update status when transaction confirms
  useEffect(() => {
    if (isSuccess && state.status === "confirming") {
      setState((prev) => ({ ...prev, status: "success" }))
    }
  }, [isSuccess, state.status])

  const pay = useCallback(
    async (amount: bigint, reservationId: string) => {
      if (!address) {
        setState({ status: "error", txHash: null, error: "Wallet not connected" })
        return null
      }

      setState({ status: "pending", txHash: null, error: null })

      try {
        const tokenAddress = getPixelTokenAddress()
        const treasuryAddress = getPublicTreasuryAddress()

        // Encode ERC20 transfer with memo in data field
        const data = encodeTransferWithMemo(treasuryAddress, amount, reservationId)

        // Send transaction to token contract with encoded data
        const txHash = await sendTransactionAsync({
          to: tokenAddress,
          data,
        })

        setState({ status: "confirming", txHash, error: null })

        return txHash
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Payment failed"
        setState({ status: "error", txHash: null, error: message })
        return null
      }
    },
    [address, sendTransactionAsync]
  )

  const reset = useCallback(() => {
    setState({ status: "idle", txHash: null, error: null })
  }, [])

  return {
    ...state,
    pay,
    reset,
    isLoading: state.status === "pending" || state.status === "confirming" || isPending || isConfirming,
  }
}
