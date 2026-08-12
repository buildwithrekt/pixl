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
import Link from "next/link"

const useCases = [
  {
    title: "Place an ad",
    description: "Promote your project, token, or brand. Your ad stays on the board forever.",
    icon: "📢",
  },
  {
    title: "Drop your art",
    description: "Upload pixel art, memes, or any image. Express yourself on-chain.",
    icon: "🎨",
  },
  {
    title: "Just hold it",
    description: "Buy space now, use it later. Or flip it on the marketplace when prices rise.",
    icon: "💎",
  },
]

const faqs = [
  {
    question: "What happens if I don't complete payment?",
    answer:
      "Your reservation expires after 10 minutes and the zone becomes available again. No tokens are charged.",
  },
  {
    question: "Can I sell my zone?",
    answer:
      "Yes! List your zone on the marketplace. Floor price rises with the tier system — early buyers profit.",
  },
  {
    question: "Can I edit my zone after payment?",
    answer:
      "In V1, zones are permanent. Once placed, your pixels stay forever on the board.",
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
      <Card variant="glow" className="h-full p-5 flex flex-col overflow-hidden">
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
        <Eyebrow className="mb-4">COLLABORATIVE ADS BOARD</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
          Buy space. Place ads. Burn tokens.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          The more space gets bought, the more expensive it becomes.
          Every purchase burns $BLOKR. Early buyers win.
        </p>
      </section>

      {/* The Flywheel - Simple */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="text-center mb-8">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
              The Flywheel
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {[
              { label: "Buy Space", icon: "🟩" },
              { label: "Price Rises", icon: "📈" },
              { label: "Tokens Burn", icon: "🔥" },
              { label: "Supply Drops", icon: "📉" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{step.icon}</span>
                  <span className="font-mono text-xs text-white">{step.label}</span>
                </div>
                {i < 3 && (
                  <span className="font-mono text-lime text-xl hidden md:block">→</span>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <span className="font-mono text-xs text-gray-500">↻ Repeat</span>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            3 Simple Steps
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
            How to claim your space
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <BentoCard delay={0}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-3xl text-lime">01</span>
            </div>
            <CardTitle className="text-lg text-white mb-3">Pick your zone</CardTitle>
            <p className="text-sm text-gray-400 leading-relaxed">
              Select any rectangular area on the 1024×1024 board.
              The bigger the zone, the more pixels you own.
            </p>
          </BentoCard>

          <BentoCard delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-3xl text-lime">02</span>
            </div>
            <CardTitle className="text-lg text-white mb-3">Pay in $BLOKR</CardTitle>
            <p className="text-sm text-gray-400 leading-relaxed">
              Price = pixels × current tier rate.
              6 tiers from 75 to 2,400 $BLOKR per pixel as the board fills.
            </p>
          </BentoCard>

          <BentoCard delay={0.2}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-3xl text-lime">03</span>
              <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
            </div>
            <CardTitle className="text-lg text-white mb-3">Tokens burn</CardTitle>
            <p className="text-sm text-gray-400 leading-relaxed">
              75% of $BLOKR payments get burned daily.
              Zero mercy on supply.
            </p>
          </BentoCard>
        </div>
      </section>

      {/* What can you do with your space? */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
              Use Cases
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
              What can you do with your space?
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {useCases.map((useCase, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card variant="glow" className="p-6 h-full">
                  <span className="text-4xl mb-4 block">{useCase.icon}</span>
                  <CardTitle className="text-lg text-white mb-2">{useCase.title}</CardTitle>
                  <p className="text-sm text-gray-400">{useCase.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tier System */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
            The earlier you buy, the cheaper it is
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Price per pixel increases as the board fills up. 6 tiers, up to 32× multiplier.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { tier: 1, price: 75, multiplier: "1×", fill: "0-10%" },
            { tier: 2, price: 150, multiplier: "2×", fill: "10-25%" },
            { tier: 3, price: 300, multiplier: "4×", fill: "25-50%" },
            { tier: 4, price: 600, multiplier: "8×", fill: "50-75%" },
            { tier: 5, price: 1200, multiplier: "16×", fill: "75-90%" },
            { tier: 6, price: 2400, multiplier: "32×", fill: "90-100%" },
          ].map((t) => (
            <Card key={t.tier} variant="glow" className="p-4 text-center">
              <div className="font-mono text-xs text-gray-500 mb-2">Tier {t.tier}</div>
              <div className="font-display text-2xl text-lime mb-1">{t.price}</div>
              <div className="font-mono text-[10px] text-gray-500">$BLOKR/px</div>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <Chip className="text-[9px]">{t.multiplier}</Chip>
                <div className="font-mono text-[9px] text-gray-600 mt-1">{t.fill}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Marketplace teaser */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            Marketplace
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Buy low. Sell high.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Bought at Tier 1? Sell at Tier 4 prices. The marketplace lets you flip your zones
            as the board fills and prices rise. Floor price = your purchase price × tier appreciation.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Chip>5% Platform Fee</Chip>
            <Chip variant="secondary">Floor Price Protection</Chip>
            <Chip>Instant Transfers</Chip>
          </div>
        </div>
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
          className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card variant="glow" className="p-6 h-full">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm text-white leading-snug">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-lime">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-4">
            Ready to claim your space?
          </h2>
          <p className="text-black/70 mb-8">
            The board is filling up. Prices are rising. Don&apos;t wait.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="bg-black text-lime hover:bg-black/90" asChild>
              <Link href="/board">Open the board →</Link>
            </Button>
            <Button size="lg" variant="secondary" className="bg-white text-black border-black hover:bg-white/90" asChild>
              <Link href="/marketplace">View marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
