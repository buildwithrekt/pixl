"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useWalletAuth } from "@/hooks/use-wallet-auth"

const NAV_LINKS = [
  { href: "/board", label: "Board" },
  { href: "/gallery", label: "Gallery" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/nfts", label: "NFTs" },
  { href: "/how-it-works", label: "How it works" },
  { href: process.env.NEXT_PUBLIC_BLOK_BUY_URL || "/blokr", label: "Get $BLOK", external: true, highlight: true },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn } = useWalletAuth()

  const handleClose = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2"
        aria-label="Open menu"
      >
        <div className="space-y-1.5">
          <span className="block w-6 h-0.5 bg-lime" />
          <span className="block w-6 h-0.5 bg-lime" />
          <span className="block w-6 h-0.5 bg-lime" />
        </div>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={handleClose}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-700 z-50 p-6"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-lime transition-colors"
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Logo */}
              <Link
                href="/"
                onClick={handleClose}
                className="block mb-8"
              >
                <span className="font-mono text-sm tracking-wider text-lime">
                  BLOKR
                </span>
              </Link>

              {/* Navigation links */}
              <nav className="space-y-4 mb-8">
                {NAV_LINKS.map((link) => (
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleClose}
                      className={`block text-lg py-2 transition-colors ${
                        link.highlight
                          ? "text-lime hover:text-lime/80"
                          : "text-gray-400 hover:text-lime"
                      }`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleClose}
                      className="block text-lg text-gray-400 hover:text-lime transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
                {isSignedIn && (
                  <Link
                    href="/profile"
                    onClick={handleClose}
                    className="block text-lg text-gray-400 hover:text-lime transition-colors py-2"
                  >
                    Profile
                  </Link>
                )}
              </nav>

              {/* Wallet button */}
              <div className="pt-4 border-t border-gray-700">
                <WalletButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
