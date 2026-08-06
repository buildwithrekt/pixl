import React from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PixelText } from "@/components/pixel-text"
import { AnimatedPixels } from "@/components/animated-pixels"

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 py-16 max-w-4xl mx-auto">
      {/* Eyebrow */}
      <Eyebrow className="mb-8">Live on Solana · Powered by $PIXEL</Eyebrow>

      {/* Headline */}
      <h1 className="font-display text-display-xl text-ink mb-4">
        One million <PixelText text="PIXELS" className="text-display-xl" />.
      </h1>

      <h2 className="font-display text-display-lg text-ink mb-6">
        Bought by degens, claimed by memecoins,
        <br />
        paid for in tokens that get burned.
      </h2>

      {/* Subheadline */}
      <p className="font-body text-lg text-ink/80 mb-10 max-w-xl">
        The price per pixel rises as the board fills. The board never forgets
        who was early.
      </p>

      {/* CTA row */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">Claim your pixels →</Button>
        <Chip>1 PX = 10 $PIXEL</Chip>
      </div>

      {/* Animated pixels */}
      <div className="mt-16 w-full">
        <AnimatedPixels rows={8} />
      </div>
    </section>
  )
}
