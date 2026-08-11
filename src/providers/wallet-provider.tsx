"use client"

import React, { createContext, useState, useEffect, useCallback } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAccount, useDisconnect, useReconnect } from "wagmi"
import { config } from "@/lib/wagmi"
import { ConnectWalletModal } from "@/components/wallet/connect-wallet-modal"

const queryClient = new QueryClient()

const STORAGE_KEY = "blokr:signedWallet"
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true"
const DEMO_WALLET = "0xDEMO000000000000000000000000000000000000"

interface WalletAuthContextType {
  isSignedIn: boolean
  signedAddress: string | null
  isModalOpen: boolean
  isDemoMode: boolean
  isComingSoon: boolean
  openModal: () => void
  closeModal: () => void
  completeSignIn: (address: string) => void
  signOut: () => void
}

export const WalletAuthContext = createContext<WalletAuthContextType | null>(null)

interface WalletProviderProps {
  children: React.ReactNode
}

function WalletAuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { reconnect } = useReconnect()

  const [isSignedIn, setIsSignedIn] = useState(DEMO_MODE)
  const [signedAddress, setSignedAddress] = useState<string | null>(DEMO_MODE ? DEMO_WALLET : null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount and try to reconnect
  useEffect(() => {
    // In demo mode, always use demo wallet
    if (DEMO_MODE) {
      setSignedAddress(DEMO_WALLET)
      setIsSignedIn(true)
      setIsHydrated(true)
      return
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSignedAddress(stored)
      setIsSignedIn(true)
      // Try to reconnect wagmi to the wallet
      reconnect()
    }
    setIsHydrated(true)
  }, [reconnect])

  // Validate stored address matches connected wallet
  useEffect(() => {
    if (!isHydrated) return

    // If wallet reconnects with same address, keep session
    if (signedAddress && isConnected && address) {
      if (signedAddress.toLowerCase() === address.toLowerCase()) {
        // Same wallet - ensure we're signed in
        if (!isSignedIn) {
          setIsSignedIn(true)
        }
      } else {
        // Different wallet connected - reset signed state
        setIsSignedIn(false)
        setSignedAddress(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // If we have a signed address but wallet disconnected
    // Keep the signed state for a grace period - wallet might reconnect
    // This prevents logout on page refresh while wallet extension loads
  }, [address, isConnected, signedAddress, isHydrated, isSignedIn])

  const openModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const completeSignIn = useCallback((addr: string) => {
    localStorage.setItem(STORAGE_KEY, addr)
    setSignedAddress(addr)
    setIsSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSignedAddress(null)
    setIsSignedIn(false)
    disconnect()
  }, [disconnect])

  const value: WalletAuthContextType = {
    isSignedIn,
    signedAddress,
    isModalOpen,
    isDemoMode: DEMO_MODE,
    isComingSoon: COMING_SOON,
    openModal,
    closeModal,
    completeSignIn,
    signOut,
  }

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
      <ConnectWalletModal />
    </WalletAuthContext.Provider>
  )
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletAuthProvider>{children}</WalletAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
