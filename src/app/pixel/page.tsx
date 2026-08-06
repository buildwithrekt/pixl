import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "$PIXEL Token",
  description: "The native currency of PIXELBOARD. Buy pixels, burn tokens. 100% deflationary with daily burns.",
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
    suffix: "$PIXEL",
  },
  {
    label: "Burned",
    value: "0",
    suffix: "$PIXEL",
    live: true,
  },
  {
    label: "Burn Rate",
    value: "100%",
    suffix: "of payments",
  },
]

const tiers = [
  { tier: 1, pixels: "0 - 100K", price: "150 $PIXEL", multiplier: "1x" },
  { tier: 2, pixels: "100K - 250K", price: "300 $PIXEL", multiplier: "2x" },
  { tier: 3, pixels: "250K - 500K", price: "600 $PIXEL", multiplier: "4x" },
  { tier: 4, pixels: "500K - 750K", price: "1,200 $PIXEL", multiplier: "8x" },
  { tier: 5, pixels: "750K - 1M", price: "2,400 $PIXEL", multiplier: "16x" },
]

export default function PixelPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav />

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <Eyebrow className="mb-4">ROBINHOOD CHAIN · ERC-20</Eyebrow>
        <h1 className="font-display text-display-xl text-ink mb-6">
          <span className="text-red">$</span>
          <span className="text-blue">P</span>
          <span className="text-orange">I</span>
          <span className="text-ink">X</span>
          <span className="text-red">E</span>
          <span className="text-blue">L</span>
        </h1>
        <p className="font-body text-lg text-ink/70 max-w-2xl mx-auto mb-8">
          The native currency of PIXELBOARD. Buy pixels, burn tokens, claim your spot on the canvas forever.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/board">Buy pixels</Link>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get $PIXEL
            </a>
          </Button>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="px-6 py-16 bg-ink">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-pixel text-[11px] text-yellow uppercase tracking-wider">
              Tokenomics
            </span>
            <h2 className="font-display text-display-lg text-paper mt-2">
              Simple. Deflationary. Permanent.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tokenomics.map((stat, i) => (
              <Card
                key={stat.label}
                shadow={["red", "blue", "yellow"][i % 3] as "red" | "blue" | "yellow"}
                className="p-6 text-center"
              >
                <CardHeader className="p-0 mb-2">
                  <span className="font-pixel text-[10px] text-ink/60 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-display text-3xl text-ink">
                      {stat.value}
                    </span>
                    {stat.live && (
                      <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
                    )}
                  </div>
                  <span className="font-body text-sm text-ink/60">
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
            <span className="font-pixel text-[11px] text-red uppercase tracking-wider">
              The burn
            </span>
            <h2 className="font-display text-display-lg text-ink mt-2 mb-6">
              Every pixel purchase burns tokens. Forever.
            </h2>
            <p className="font-body text-ink/70 mb-4">
              When you buy pixels on PIXELBOARD, 100% of your $PIXEL payment goes to the treasury wallet. Every 24 hours, the treasury burns all collected tokens — removed from circulation forever.
            </p>
            <p className="font-body text-ink/70 mb-6">
              No team allocation. No recycling. Daily burns. Pure, permanent deflation.
            </p>
            <Chip>
              <Sprite map={SPRITE_MAPS.fire} pixelSize={2} className="inline-block mr-1" />
              100% BURN RATE
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
      <section className="px-6 py-16 bg-yellow/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-pixel text-[11px] text-blue uppercase tracking-wider">
              Pricing tiers
            </span>
            <h2 className="font-display text-display-lg text-ink mt-2">
              Price rises as the board fills
            </h2>
            <p className="font-body text-ink/70 mt-4 max-w-xl mx-auto">
              Early buyers get the best rates. As more pixels are claimed, the price per pixel increases automatically.
            </p>
          </div>

          <div className="bg-white border-[2.5px] border-ink rounded-xl overflow-hidden shadow-hard-md">
            <table className="w-full">
              <thead className="bg-ink text-paper">
                <tr>
                  <th className="font-pixel text-[11px] uppercase tracking-wider py-4 px-6 text-left">
                    Tier
                  </th>
                  <th className="font-pixel text-[11px] uppercase tracking-wider py-4 px-6 text-left">
                    Pixels Sold
                  </th>
                  <th className="font-pixel text-[11px] uppercase tracking-wider py-4 px-6 text-right">
                    Price / Pixel
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr
                    key={tier.tier}
                    className={i % 2 === 0 ? "bg-paper" : "bg-white"}
                  >
                    <td className="py-4 px-6">
                      <span className="font-pixel text-lg text-ink">
                        {String(tier.tier).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body text-ink/70">
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
        <h2 className="font-display text-display-lg text-ink mb-6">
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
