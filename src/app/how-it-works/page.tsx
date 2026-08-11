"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"
import { Button } from "@/components/ui/button"
import { WalletLogos } from "@/components/icons/wallet-logos"
import Link from "next/link"

const faqs = [
  {
    question: "What happens if I don't complete payment?",
    answer:
      "Your reservation expires after 10 minutes and the zone becomes available again. No tokens are charged.",
  },
  {
    question: "Can I edit my zone after payment?",
    answer:
      "In V1, zones are permanent and immutable. Once placed, your pixels stay forever.",
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
}

function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className={className}
    >
      <Card variant="glow" className="h-full p-4 flex flex-col overflow-hidden">
        {children}
      </Card>
    </motion.div>
  )
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black">
      <Nav />

      {/* Hero */}
      <section className="px-6 py-16 max-w-5xl mx-auto text-center">
        <Eyebrow className="mb-4">THE PROCESS</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
          How it works
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          From wallet connection to pixel immortality. No complicated contracts,
          no hidden fees.
        </p>
      </section>

      {/* Bento Grid - No gaps layout */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 auto-rows-[140px]">
          {/* Step 01 - Connect Wallet - Large */}
          <BentoCard
            className="col-span-4 md:col-span-3 row-span-2"
            delay={0}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-3xl text-lime">01</span>
            </div>
            <CardTitle className="text-lg text-white mb-3">Connect your wallet</CardTitle>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Connect with MetaMask, Coinbase Wallet, or WalletConnect. Make
              sure you&apos;re on Robinhood Chain.
            </p>
            <WalletLogos size={32} />
          </BentoCard>

          {/* Grid specs */}
          <BentoCard className="col-span-2 md:col-span-1" delay={0.1}>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <span className="font-mono text-2xl text-lime">128×128</span>
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-2">
                Grid cells
              </span>
            </div>
          </BentoCard>

          {/* Pixel size */}
          <BentoCard className="col-span-2 md:col-span-2" delay={0.15}>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <span className="font-mono text-2xl text-lime">8×8</span>
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-2">
                Pixels per cell
              </span>
            </div>
          </BentoCard>

          {/* Step 02 - Pick Zone */}
          <BentoCard className="col-span-4 md:col-span-3" delay={0.2}>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl text-lime">02</span>
              </div>
              <CardTitle className="text-base text-white mb-2">Pick your zone</CardTitle>
              <p className="text-xs text-gray-400">
                Select a rectangular area on the 1024×1024 canvas. Min 8×8
                pixels, snaps to grid.
              </p>
            </div>
          </BentoCard>

          {/* Step 03 - Reserve & Upload */}
          <BentoCard className="col-span-4 md:col-span-3" delay={0.25}>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl text-lime">03</span>
              </div>
              <CardTitle className="text-base text-white mb-2">Reserve & upload</CardTitle>
              <p className="text-xs text-gray-400">
                10-minute reservation window. Price locked. Upload any image —
                PNG, JPG, GIF, WebP.
              </p>
            </div>
          </BentoCard>

          {/* TTL */}
          <BentoCard className="col-span-2 md:col-span-2" delay={0.3}>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <span className="font-mono text-3xl text-lime">10</span>
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-2">
                Min TTL
              </span>
            </div>
          </BentoCard>

          {/* Total pixels */}
          <BentoCard className="col-span-2 md:col-span-1" delay={0.35}>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <span className="font-mono text-lg text-lime">1M+</span>
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-2">
                Pixels
              </span>
            </div>
          </BentoCard>

          {/* Step 04 - Pay in $BLOK */}
          <BentoCard
            className="col-span-4 md:col-span-3 row-span-2"
            delay={0.4}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-3xl text-lime">04</span>
            </div>
            <CardTitle className="text-lg text-white mb-3">Pay in $BLOK</CardTitle>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Confirm your payment in $BLOK tokens. Price = pixels × tier
              rate. 100% on-chain, transaction linked to your zone.
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip>TIER 1: 150 $BLOK</Chip>
              <Chip variant="secondary">TIER 5: 2,400 $BLOK</Chip>
            </div>
          </BentoCard>

          {/* Step 05 - Burn */}
          <BentoCard
            className="col-span-4 md:col-span-3 row-span-2"
            delay={0.45}
          >
            <div className="bg-lime/10 border border-lime/30 rounded-[4px] p-6 h-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-3xl text-lime">05</span>
                <Sprite map={SPRITE_MAPS.fire} pixelSize={5} />
              </div>
              <CardTitle className="text-lg text-lime mb-3">
                Tokens get burned
              </CardTitle>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                All collected $BLOK tokens are sent to the treasury and
                burned every 24 hours. Your pixels live forever on the canvas.
              </p>
              <div className="flex items-center gap-4">
                <Chip>100% BURN</Chip>
                <span className="font-mono text-[10px] text-lime uppercase">
                  Zero mercy on supply
                </span>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Visual flow */}
      <section className="px-6 py-12 bg-gray-900">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
            {["Wallet", "Zone", "Upload", "$BLOK", "Burn", "Forever"].map(
              (item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Chip variant={i % 2 === 0 ? "default" : "secondary"}>
                    {item === "Burn" && (
                      <Sprite
                        map={SPRITE_MAPS.fire}
                        pixelSize={2}
                        className="inline-block mr-1"
                      />
                    )}
                    {item}
                  </Chip>
                  {i < 5 && (
                    <span className="font-mono text-lime text-lg">→</span>
                  )}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* FAQs */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
            Questions? Answers.
          </h2>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card variant="glow" className="p-6">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-xs text-white leading-snug">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to claim your spot?
          </h2>
          <p className="text-gray-400 mb-8">
            Pick your zone on the board and become part of pixel history.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/board">Open the board</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/blokr">Learn about $BLOK</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
