"use client"

import React, { useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { truncateAddress } from "@/lib/utils"

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-pixel text-[10px] text-ink uppercase tracking-wider">
          {truncateAddress(address)}
        </span>
        <Button variant="secondary" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Launch app"}
      </Button>

      {showConnectors && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowConnectors(false)}
          />

          {/* Connector list */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border-2 border-ink rounded-[14px] shadow-hard-lg p-2 min-w-[200px]">
            <p className="font-pixel text-[10px] text-ink/60 uppercase px-3 py-2">
              Connect wallet
            </p>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector })
                  setShowConnectors(false)
                }}
                className="w-full text-left px-3 py-2 text-sm font-body hover:bg-yellow rounded-lg transition-colors"
              >
                {connector.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
