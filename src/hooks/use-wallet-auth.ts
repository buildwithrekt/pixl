"use client"

import { useContext } from "react"
import { WalletAuthContext } from "@/providers/wallet-provider"

export function useWalletAuth() {
  const context = useContext(WalletAuthContext)
  if (!context) {
    throw new Error("useWalletAuth must be used within WalletProvider")
  }
  return context
}
