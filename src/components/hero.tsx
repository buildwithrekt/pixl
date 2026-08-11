import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PixelText } from "@/components/pixel-text"
import { AnimatedPixels } from "@/components/animated-pixels"

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-4 sm:px-6 py-10 sm:py-16 max-w-4xl mx-auto">
      {/* Eyebrow */}
      <Eyebrow className="mb-6 sm:mb-8 text-[9px] sm:text-[11px]">
        Live on Robinhood Chain · Powered by $BLOK
      </Eyebrow>

      {/* Headline */}
      <h1 className="font-display text-3xl sm:text-display-lg md:text-display-xl text-white mb-3 sm:mb-4">
        One million <PixelText text="PIXELS" className="text-3xl sm:text-display-lg md:text-display-xl" />.
      </h1>

      <h2 className="font-display text-xl sm:text-2xl md:text-display-lg text-white mb-4 sm:mb-6">
        <span className="block sm:inline">Bought by degens, claimed by memecoins,</span>
        <span className="hidden sm:inline"><br /></span>
        <span className="block sm:inline"> paid for in tokens that get burned.</span>
      </h2>

      {/* Subheadline */}
      <p className="font-body text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 max-w-xl px-2">
        The price per pixel rises as the board fills. The board never forgets
        who was early.
      </p>

      {/* CTA row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/board">Claim your pixels →</Link>
        </Button>
        <Chip className="text-[10px] sm:text-xs">1 PX = 150 $BLOK</Chip>
      </div>

      {/* Animated pixels */}
      <div className="mt-10 sm:mt-16 w-full overflow-hidden">
        <div className="hidden sm:block">
          <AnimatedPixels rows={8} />
        </div>
        <div className="sm:hidden">
          <AnimatedPixels rows={4} />
        </div>
      </div>
    </section>
  )
}
