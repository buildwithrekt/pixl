import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "$BLOK Token",
  description: "The native currency of BLOKR. Buy pixels, burn tokens. 75% of payments burned daily.",
}
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tokenomics = [
  {
    label: "Total Supply",
    value: "1,000,000,000",
    suffix: "$BLOK",
  },
  {
    label: "Burned",
    value: "0",
    suffix: "$BLOK",
    live: true,
  },
  {
    label: "Burn Rate",
    value: "75%",
    suffix: "of payments",
  },
]

const tiers = [
  { tier: 1, pixels: "0 - 100K", price: "75 $BLOK", multiplier: "1x" },
  { tier: 2, pixels: "100K - 250K", price: "150 $BLOK", multiplier: "2x" },
  { tier: 3, pixels: "250K - 500K", price: "300 $BLOK", multiplier: "4x" },
  { tier: 4, pixels: "500K - 750K", price: "600 $BLOK", multiplier: "8x" },
  { tier: 5, pixels: "750K - 1M", price: "1,200 $BLOK", multiplier: "16x" },
]

export default function BlokPage() {
  return (
    <main className="min-h-screen bg-black">
      <Nav />

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <Eyebrow className="mb-4">ROBINHOOD CHAIN · ERC-20</Eyebrow>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-lime mb-6">
          $BLOK
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          The native currency of BLOKR. Buy pixels, burn tokens, claim your spot on the canvas forever.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/board">Buy pixels</Link>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href={process.env.NEXT_PUBLIC_BLOK_BUY_URL || "https://pump.fun"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get $BLOK
            </a>
          </Button>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
              Tokenomics
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
              Simple. Deflationary. Permanent.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tokenomics.map((stat) => (
              <Card
                key={stat.label}
                variant="glow"
                className="p-6 text-center"
              >
                <CardHeader className="p-0 mb-2">
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-display text-3xl text-white">
                      {stat.value}
                    </span>
                    {stat.live && (
                      <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {stat.suffix}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Burn */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
              The burn
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2 mb-6">
              Every pixel purchase burns tokens. Forever.
            </h2>
            <p className="text-gray-400 mb-4">
              When you buy pixels on BLOKR, 75% of your $BLOK payment gets burned. Every 24 hours, tokens are removed from circulation forever. 25% goes to the team for development.
            </p>
            <p className="text-gray-400 mb-6">
              No team allocation. No recycling. Daily burns. Pure, permanent deflation.
            </p>
            <Chip>
              <Sprite map={SPRITE_MAPS.fire} pixelSize={2} className="inline-block mr-1" />
              75% BURN RATE
            </Chip>
          </div>
          <div className="flex-shrink-0">
            <div className="relative">
              <Sprite map={SPRITE_MAPS.fire} pixelSize={12} />
              <Sprite
                map={SPRITE_MAPS.fire}
                pixelSize={8}
                className="absolute -left-8 top-12 opacity-60"
              />
              <Sprite
                map={SPRITE_MAPS.fire}
                pixelSize={6}
                className="absolute -right-6 top-8 opacity-40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
              Pricing tiers
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
              Price rises as the board fills
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Early buyers get the best rates. As more pixels are claimed, the price per pixel increases automatically.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-[6px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-lime text-black">
                <tr>
                  <th className="font-mono text-[11px] uppercase tracking-wider py-4 px-6 text-left">
                    Tier
                  </th>
                  <th className="font-mono text-[11px] uppercase tracking-wider py-4 px-6 text-left">
                    Pixels Sold
                  </th>
                  <th className="font-mono text-[11px] uppercase tracking-wider py-4 px-6 text-right">
                    Price / Pixel
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr
                    key={tier.tier}
                    className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-lg text-white">
                        {String(tier.tier).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {tier.pixels}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Chip className="inline-flex">{tier.price}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to claim your pixels?
        </h2>
        <Button size="lg" asChild>
          <Link href="/board">Launch the board</Link>
        </Button>
      </section>

      <Footer />
    </main>
  )
}
