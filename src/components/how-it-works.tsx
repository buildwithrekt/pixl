import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

const steps = [
  {
    number: "01",
    title: "Pick your zone",
    description:
      "Select a rectangular area on the 1024×1024 canvas. Minimum 8×8 pixels, snap to grid.",
    shadow: "red" as const,
  },
  {
    number: "02",
    title: "Pay in $BLOKR",
    description:
      "Price per pixel rises as the board fills. Pay with $BLOKR token - all payments are on-chain.",
    shadow: "blue" as const,
  },
  {
    number: "03",
    title: "Tokens get burned",
    description:
      "75% of collected $BLOKR goes to the burn wallet. Every 24h, everything burns. Zero mercy on supply.",
    shadow: "yellow" as const,
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
          How it works
        </span>
        <h2 className="font-display text-display-lg text-white mt-2">
          Three steps to pixel immortality
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Card key={step.number} variant="glow" className="p-6">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-2xl text-lime">
                  {step.number}
                </span>
                {step.number === "03" && (
                  <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
                )}
              </div>
              <CardTitle className="text-sm text-white">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
