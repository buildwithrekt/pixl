"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import { truncateAddress } from "@/lib/utils"

export function WalletButton() {
  const { isSignedIn, signedAddress, openModal, signOut } = useWalletAuth()

  if (isSignedIn && signedAddress) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-lime uppercase tracking-wider">
          {truncateAddress(signedAddress)}
        </span>
        <Button variant="secondary" size="sm" onClick={signOut}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={openModal}>
      Launch app
    </Button>
  )
}
