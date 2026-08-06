"use client"

import React from "react"
import Link from "next/link"
import { WalletButton } from "@/components/wallet/wallet-button"
import { ThemeToggle } from "@/components/theme-toggle"

const WORDMARK_COLORS = [
  "text-red",    // P
  "text-blue",   // I
  "text-orange", // X
  "text-ink",    // E
  "text-red",    // L
  "text-blue",   // B
  "text-orange", // O
  "text-ink",    // A
  "text-red",    // R
  "text-blue",   // D
  "text-ink",    // _
]

export function Nav() {
  return (
    <nav className="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      {/* Left links */}
      <div className="flex items-center gap-8">
        <Link
          href="/board"
          className="font-body text-sm text-ink hover:text-blue transition-colors"
        >
          Board
        </Link>
        <Link
          href="/how-it-works"
          className="font-body text-sm text-ink hover:text-blue transition-colors"
        >
          How it works
        </Link>
        <Link
          href="/pixel"
          className="font-body text-sm text-ink hover:text-blue transition-colors"
        >
          $PIXEL
        </Link>
        <Link
          href="/gallery"
          className="font-body text-sm text-ink hover:text-blue transition-colors"
        >
          Gallery
        </Link>
      </div>

      {/* Center wordmark */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 hidden md:block"
      >
        <span className="font-pixel text-sm tracking-wider">
          {"PIXELBOARD_".split("").map((char, i) => (
            <span key={i} className={WORDMARK_COLORS[i]}>
              {char}
            </span>
          ))}
        </span>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <WalletButton />
      </div>
    </nav>
  )
}
