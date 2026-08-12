"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

const steps = [
  {
    id: 1,
    title: "Buy Pixels",
    description: "Pay in $BLOK",
    icon: "grid",
  },
  {
    id: 2,
    title: "Tokens Burn",
    description: "75% daily burn",
    icon: "fire",
  },
  {
    id: 3,
    title: "Supply Drops",
    description: "Scarcity increases",
    icon: "down",
  },
  {
    id: 4,
    title: "Price Rises",
    description: "Tier multiplier",
    icon: "up",
  },
]

export function Flywheel() {
  return (
    <section className="px-6 py-20 bg-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-lime uppercase tracking-wider">
            The $BLOK Flywheel
          </span>
          <h2 className="font-display text-display-lg text-white mt-2 mb-4">
            Every pixel burns. Every burn compounds.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A self-reinforcing loop: the more pixels get claimed, the more $BLOK burns,
            the scarcer the supply, the higher the price. Early buyers win.
          </p>
        </div>

        {/* Flywheel visual */}
        <div className="relative">
          {/* Desktop: Circular layout */}
          <div className="hidden md:block">
            <div className="relative w-[500px] h-[500px] mx-auto">
              {/* Center burn indicator */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sprite map={SPRITE_MAPS.fire} pixelSize={8} />
                <span className="font-mono text-xs text-lime mt-2">BURN</span>
              </motion.div>

              {/* Rotating arrows */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 500 500"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  cx="250"
                  cy="250"
                  r="180"
                  fill="none"
                  stroke="rgba(204, 253, 3, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="20 10"
                />
              </motion.svg>

              {/* Steps positioned in a circle */}
              {steps.map((step, i) => {
                const angle = (i * 90 - 90) * (Math.PI / 180)
                const radius = 200
                const x = 250 + radius * Math.cos(angle)
                const y = 250 + radius * Math.sin(angle)

                return (
                  <motion.div
                    key={step.id}
                    className="absolute w-32 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x, top: y }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-black border border-lime/30 rounded-lg p-4 text-center hover:border-lime transition-colors">
                      <div className="flex justify-center mb-2">
                        {step.icon === "fire" ? (
                          <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
                        ) : step.icon === "grid" ? (
                          <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="bg-lime rounded-sm" />
                            ))}
                          </div>
                        ) : step.icon === "down" ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-lime">
                            <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-lime">
                            <path d="M12 20V4m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-lime uppercase tracking-wider block">
                        {step.title}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {step.description}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Connecting arrows */}
              {steps.map((_, i) => {
                const startAngle = (i * 90 - 45) * (Math.PI / 180)
                const endAngle = (i * 90 + 45) * (Math.PI / 180)
                const radius = 140
                const startX = 250 + radius * Math.cos(startAngle)
                const startY = 250 + radius * Math.sin(startAngle)
                const endX = 250 + radius * Math.cos(endAngle)
                const endY = 250 + radius * Math.sin(endAngle)

                return (
                  <motion.svg
                    key={`arrow-${i}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 500 500"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ delay: i * 0.2 + 0.5, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.path
                      d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
                      fill="none"
                      stroke="rgba(204, 253, 3, 0.4)"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="rgba(204, 253, 3, 0.6)"
                        />
                      </marker>
                    </defs>
                  </motion.svg>
                )
              })}
            </div>
          </div>

          {/* Mobile: Linear layout */}
          <div className="md:hidden space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 bg-black border border-lime/30 rounded-lg p-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-lime/10 rounded-lg flex items-center justify-center">
                    {step.icon === "fire" ? (
                      <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
                    ) : step.icon === "grid" ? (
                      <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-lime rounded-sm" />
                        ))}
                      </div>
                    ) : step.icon === "down" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-lime">
                        <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-lime">
                        <path d="M12 20V4m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-xs text-lime uppercase tracking-wider block">
                      {step.title}
                    </span>
                    <span className="text-sm text-gray-400">
                      {step.description}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-7 top-full h-4 w-px bg-lime/30" />
                )}
              </motion.div>
            ))}
            {/* Loop back indicator */}
            <motion.div
              className="flex items-center justify-center gap-2 pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-lime">
                <path d="M4 12a8 8 0 018-8m0 16a8 8 0 01-8-8m8-8v4m0-4l3 3m-3-3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-mono text-xs text-lime uppercase">Repeat</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Daily Burns", value: "75%" },
            { label: "Price Tiers", value: "6" },
            { label: "Max Multiplier", value: "32x" },
            { label: "Total Pixels", value: "1M+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-black border border-gray-800 rounded-lg p-4 text-center"
            >
              <span className="font-display text-2xl text-lime block">
                {stat.value}
              </span>
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
