import Link from "next/link"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

const BLOK_BUY_URL = process.env.NEXT_PUBLIC_BLOK_BUY_URL || "/blokr"

const links = {
  product: [
    { label: "Board", href: "/board" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Get $BLOK", href: BLOK_BUY_URL, external: true },
  ],
  support: [
    { label: "Recover payment", href: "/recover" },
    { label: "Explorer", href: "https://robinhoodchain.blockscout.com", external: true },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
  social: [
    { label: "X / Twitter", href: "https://twitter.com/BLOKR", external: true },
    { label: "Discord", href: "https://discord.gg/blokr", external: true },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
              <span className="font-mono text-lg text-white">BLOKR</span>
            </div>
            <p className="text-sm text-gray-500">
              One million pixels. Bought by degens, claimed by memecoins.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-[10px] text-lime uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-lime transition-colors"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-lime transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-mono text-[10px] text-lime uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {links.support.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-lime transition-colors"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-lime transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-[10px] text-lime uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-mono text-[10px] text-lime uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              {links.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-lime transition-colors"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BLOKR. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Built on</span>
            <span className="font-mono text-lime">Robinhood Chain</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
