import Link from "next/link"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

const links = {
  product: [
    { label: "Board", href: "/board" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "How it works", href: "/how-it-works" },
    { label: "$BLOK", href: "/blok" },
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
    { label: "X / Twitter", href: "https://twitter.com/BLOK", external: true },
    { label: "Discord", href: "https://discord.gg/blok", external: true },
  ],
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
              <span className="font-pixel text-lg text-paper">BLOK</span>
            </div>
            <p className="text-sm text-paper/60">
              One million pixels. Bought by degens, claimed by memecoins.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-pixel text-[10px] text-yellow uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/70 hover:text-paper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-pixel text-[10px] text-yellow uppercase tracking-wider mb-4">
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
                      className="text-sm text-paper/70 hover:text-paper transition-colors"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-paper/70 hover:text-paper transition-colors"
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
            <h4 className="font-pixel text-[10px] text-yellow uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/70 hover:text-paper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-pixel text-[10px] text-yellow uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              {links.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-paper/70 hover:text-paper transition-colors"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-paper/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-paper/50">
            © {new Date().getFullYear()} BLOK. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-paper/50">
            <span>Built on</span>
            <span className="font-pixel text-[#ccff00]">Robinhood Chain</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
