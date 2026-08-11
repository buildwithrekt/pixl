"use client"

import React from "react"
import Link from "next/link"
import { WalletButton } from "@/components/wallet/wallet-button"
import { MobileNav } from "@/components/mobile-nav"
import { useWalletAuth } from "@/hooks/use-wallet-auth"

export function Nav() {
  const { isSignedIn } = useWalletAuth()

  return (
    <header className="w-full bg-black border-b border-gray-800">
      <nav className="relative flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto w-full">
      {/* Mobile: Logo on left */}
      <Link href="/" className="md:hidden">
        <span className="font-mono text-xs tracking-wider text-lime">
          BLOKR
        </span>
      </Link>

      {/* Desktop: Left links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/board"
          className="text-sm text-gray-400 hover:text-lime transition-colors"
        >
          Board
        </Link>
        <Link
          href="/gallery"
          className="text-sm text-gray-400 hover:text-lime transition-colors"
        >
          Gallery
        </Link>
        <Link
          href="/marketplace"
          className="text-sm text-gray-400 hover:text-lime transition-colors"
        >
          Marketplace
        </Link>
        <a
          href={process.env.NEXT_PUBLIC_BLOK_BUY_URL || "/blokr"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-lime hover:text-lime/80 transition-colors"
        >
          Get $BLOK
        </a>
        {isSignedIn && (
          <Link
            href="/profile"
            className="text-sm text-gray-400 hover:text-lime transition-colors"
          >
            Profile
          </Link>
        )}
      </div>

      {/* Desktop: Center wordmark */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 hidden md:block"
      >
        <span className="font-mono text-sm tracking-wider text-lime">
          BLOKR
        </span>
      </Link>

      {/* Desktop: Right side - How it works + Wallet button */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/how-it-works"
          className="text-sm text-lime animate-pulse hover:text-lime/80 transition-colors"
        >
          How it works
        </Link>
        <WalletButton />
      </div>

      {/* Mobile: Hamburger menu */}
      <MobileNav />
    </nav>
    </header>
  )
}
