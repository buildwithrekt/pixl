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
    title: "Pay in $PIXEL",
    description:
      "Price per pixel rises as the board fills. Pay with $PIXEL token - all payments are on-chain.",
    shadow: "blue" as const,
  },
  {
    number: "03",
    title: "Tokens get burned",
    description:
      "100% of collected $PIXEL goes to the treasury. Every 24h, everything burns. Zero mercy on supply.",
    shadow: "yellow" as const,
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="font-pixel text-[11px] text-blue uppercase tracking-wider">
          How it works
        </span>
        <h2 className="font-display text-display-lg text-ink mt-2">
          Three steps to pixel immortality
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Card key={step.number} shadow={step.shadow} className="p-6">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-pixel text-2xl text-ink">
                  {step.number}
                </span>
                {step.number === "03" && (
                  <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
                )}
              </div>
              <CardTitle className="text-sm">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-ink/70 leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
