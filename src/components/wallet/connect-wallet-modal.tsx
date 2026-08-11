"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAccount, useConnect, useSignMessage } from "wagmi"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { MetaMaskLogo, CoinbaseLogo } from "@/components/icons/wallet-logos"
import { useWalletAuth } from "@/hooks/use-wallet-auth"
import type { Connector } from "wagmi"

type Step = "select" | "connecting" | "signing" | "error"

interface WalletInfo {
  id: string
  name: string
  icon: React.ReactNode
  installed: boolean
  installUrl?: string
  connector?: Connector
}

const INSTALL_URLS: Record<string, string> = {
  metaMask: "https://metamask.io/download/",
  "io.metamask": "https://metamask.io/download/",
  coinbaseWallet: "https://www.coinbase.com/wallet/downloads",
  "com.coinbase.wallet": "https://www.coinbase.com/wallet/downloads",
  rabby: "https://rabby.io/",
  "io.rabby": "https://rabby.io/",
  phantom: "https://phantom.app/download",
  "app.phantom": "https://phantom.app/download",
}

const SIGN_MESSAGE = "Sign to connect to BLOKR"

export function ConnectWalletModal() {
  const { isModalOpen, closeModal, completeSignIn } = useWalletAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { signMessageAsync, isPending: isSigning } = useSignMessage()

  const [step, setStep] = useState<Step>("select")
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)

  // Detect installed wallets
  useEffect(() => {
    const detectWallets = async () => {
      const detected: WalletInfo[] = []

      for (const connector of connectors) {
        const connectorId = connector.id.toLowerCase()
        const connectorName = connector.name.toLowerCase()

        // Determine wallet type and icon
        let icon: React.ReactNode = null
        let installUrl: string | undefined

        if (connectorId.includes("metamask") || connectorName.includes("metamask")) {
          icon = <MetaMaskLogo size={32} />
          installUrl = INSTALL_URLS.metaMask
        } else if (connectorId.includes("coinbase") || connectorName.includes("coinbase")) {
          icon = <CoinbaseLogo size={32} />
          installUrl = INSTALL_URLS.coinbaseWallet
        } else if (connectorId.includes("phantom") || connectorName.includes("phantom")) {
          icon = <PhantomLogo size={32} />
          installUrl = INSTALL_URLS.phantom
        } else if (connectorId.includes("rabby") || connectorName.includes("rabby")) {
          icon = <RabbyLogo size={32} />
          installUrl = INSTALL_URLS.rabby
        } else if (connectorId === "injected") {
          // Generic injected wallet
          icon = <InjectedWalletIcon size={32} />
        } else {
          // Skip unknown connectors
          continue
        }

        // Check if wallet is installed
        let installed = false
        try {
          const provider = await connector.getProvider()
          installed = !!provider
        } catch {
          installed = false
        }


        detected.push({
          id: connector.id,
          name: connector.name,
          icon,
          installed,
          installUrl,
          connector,
        })
      }

      // Sort: installed first, then by name
      detected.sort((a, b) => {
        if (a.installed && !b.installed) return -1
        if (!a.installed && b.installed) return 1
        return a.name.localeCompare(b.name)
      })

      setWallets(detected)
    }

    if (isModalOpen) {
      detectWallets()
    }
  }, [connectors, isModalOpen])

  // Handle wallet connection
  const handleConnect = useCallback(async (wallet: WalletInfo) => {
    if (!wallet.installed) {
      // Open install URL
      if (wallet.installUrl) {
        window.open(wallet.installUrl, "_blank")
      }
      return
    }

    if (!wallet.connector) return

    setSelectedConnector(wallet.connector)
    setStep("connecting")
    setError(null)

    try {
      connect({ connector: wallet.connector })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
      setStep("error")
    }
  }, [connect])

  // Watch for connection success
  useEffect(() => {
    if (isConnected && address && step === "connecting") {
      setStep("signing")
    }
  }, [isConnected, address, step])

  // Handle sign message
  const handleSign = useCallback(async () => {
    if (!address) return

    setError(null)

    try {
      await signMessageAsync({ message: SIGN_MESSAGE })
      completeSignIn(address)
      closeModal()
    } catch (err) {
      // User rejected signature - go back to select
      setError("Signature rejected. Please try again.")
      setStep("error")
    }
  }, [address, signMessageAsync, completeSignIn, closeModal])

  // Reset on modal close
  useEffect(() => {
    if (!isModalOpen) {
      setStep("select")
      setError(null)
      setSelectedConnector(null)
    }
  }, [isModalOpen])

  const handleClose = () => {
    closeModal()
  }

  const handleRetry = () => {
    setStep("select")
    setError(null)
    setSelectedConnector(null)
  }

  return (
    <Modal isOpen={isModalOpen} onClose={handleClose}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-lime">
            {step === "select" && "Connect wallet"}
            {step === "connecting" && "Connecting"}
            {step === "signing" && "Verify ownership"}
            {step === "error" && "Connection failed"}
          </span>
        </div>

        {/* Select wallet step */}
        {step === "select" && (
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                className="w-full flex items-center gap-4 p-4 bg-black border border-gray-700 rounded-[4px] hover:border-lime hover:shadow-[0_0_15px_rgba(204,253,3,0.15)] transition-all"
              >
                <div className="flex-shrink-0">{wallet.icon}</div>
                <span className="flex-1 text-left font-mono text-sm text-white">
                  {wallet.name}
                </span>
                {wallet.installed ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                    Connect
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-lime">
                    Install
                  </span>
                )}
              </button>
            ))}

            {wallets.length === 0 && (
              <p className="text-center text-gray-500 font-mono text-sm py-4">
                Detecting wallets...
              </p>
            )}
          </div>
        )}

        {/* Connecting step */}
        {step === "connecting" && (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto border-2 border-lime border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-mono text-sm text-white">
              Approve connection in your wallet
            </p>
            <p className="font-mono text-xs text-gray-500 mt-2">
              {selectedConnector?.name}
            </p>
          </div>
        )}

        {/* Signing step */}
        {step === "signing" && (
          <div className="text-center py-4">
            <p className="font-mono text-sm text-white mb-2">
              Sign a message to verify you own this wallet.
            </p>
            <p className="font-mono text-xs text-gray-500 mb-6">
              This is free and does not send a transaction.
            </p>
            <Button onClick={handleSign} disabled={isSigning} className="w-full">
              {isSigning ? "Waiting for signature..." : "Sign message"}
            </Button>
          </div>
        )}

        {/* Error step */}
        {step === "error" && (
          <div className="text-center py-4">
            <p className="font-mono text-sm text-white mb-6">
              {error || "Something went wrong"}
            </p>
            <Button onClick={handleRetry} variant="secondary" className="w-full">
              Try again
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// Simple Rabby logo (pixel style)
function RabbyLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#8697FF" />
      <ellipse cx="16" cy="18" rx="8" ry="7" fill="white" />
      <circle cx="12" cy="16" r="2" fill="#8697FF" />
      <circle cx="20" cy="16" r="2" fill="#8697FF" />
      <ellipse cx="16" cy="10" rx="10" ry="5" fill="white" />
    </svg>
  )
}

// Generic injected wallet icon
function InjectedWalletIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#ccfd03" />
      <rect x="8" y="10" width="16" height="12" rx="2" fill="black" />
      <rect x="10" y="14" width="8" height="2" fill="#ccfd03" />
      <rect x="10" y="18" width="6" height="2" fill="#ccfd03" />
    </svg>
  )
}

// Phantom logo
function PhantomLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#phantom-gradient)" />
      <path
        d="M23.5 16.5C23.5 20.6421 20.1421 24 16 24C11.8579 24 8.5 20.6421 8.5 16.5C8.5 12.3579 11.8579 9 16 9C20.1421 9 23.5 12.3579 23.5 16.5Z"
        fill="white"
      />
      <circle cx="13" cy="15" r="1.5" fill="#AB9FF2" />
      <circle cx="19" cy="15" r="1.5" fill="#AB9FF2" />
      <defs>
        <linearGradient id="phantom-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#534BB1" />
          <stop offset="1" stopColor="#551BF9" />
        </linearGradient>
      </defs>
    </svg>
  )
}
