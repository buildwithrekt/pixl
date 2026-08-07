"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { formatNumber } from "@/lib/utils"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

interface Stats {
  pixelsSold: number
  currentTier: number
  pricePerPixel: number
  zonesCount: number
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats>({
    pixelsSold: 0,
    currentTier: 1,
    pricePerPixel: 150,
    zonesCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [priceRes, zonesRes] = await Promise.all([
          fetch("/api/price"),
          fetch("/api/zones"),
        ])

        if (priceRes.ok) {
          const priceData = await priceRes.json()
          setStats((prev) => ({
            ...prev,
            pixelsSold: priceData.pixelsSold || 0,
            currentTier: priceData.currentTier || 1,
            pricePerPixel: priceData.pricePerPixel || 150,
          }))
        }

        if (zonesRes.ok) {
          const zonesData = await zonesRes.json()
          setStats((prev) => ({
            ...prev,
            zonesCount: zonesData.zones?.length || 0,
          }))
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const totalPixels = 1_048_576
  const percentFilled = (stats.pixelsSold / totalPixels) * 100

  // Estimate total $BLOK burned (simplified: pixelsSold × current price)
  // In reality, burn calculation would account for tier changes
  const estimatedBurn = stats.pixelsSold * stats.pricePerPixel

  const statItems = [
    {
      label: "Pixels Claimed",
      value: formatNumber(stats.pixelsSold),
      subtext: `of ${formatNumber(totalPixels)}`,
      shadowClass: "shadow-hard-blue",
    },
    {
      label: "$BLOK Burned",
      value: formatNumber(estimatedBurn),
      subtext: "tokens burned forever",
      shadowClass: "shadow-hard-red",
      hasFireIcon: true,
    },
    {
      label: "Current Tier",
      value: stats.currentTier.toString(),
      subtext: `${stats.pricePerPixel} $BLOK/px`,
      shadowClass: "shadow-hard-yellow",
    },
    {
      label: "Zones Painted",
      value: stats.zonesCount.toString(),
      subtext: "unique artworks",
      shadowClass: "shadow-hard-blue",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-6 bg-paper">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
            <span className="font-pixel text-[11px] text-red uppercase tracking-wide">
              Live Stats
            </span>
            <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ink">
            The board is filling up
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className={`
                bg-white border-2 border-ink rounded-xl p-4 md:p-6
                ${item.shadowClass}
              `}
            >
              <span className="font-pixel text-[9px] md:text-[10px] text-ink/60 uppercase flex items-center gap-1">
                {item.hasFireIcon && <Sprite map={SPRITE_MAPS.fire} pixelSize={2} />}
                {item.label}
              </span>
              <div className="font-display text-2xl md:text-3xl text-ink mt-1 flex items-center gap-2">
                {isLoading ? (
                  <span className="animate-pulse">---</span>
                ) : (
                  <>
                    {item.value}
                    {item.hasFireIcon && <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />}
                  </>
                )}
              </div>
              <span className="text-xs text-ink/50">{item.subtext}</span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-8 bg-white border-2 border-ink rounded-xl p-4 shadow-hard-blue">
          <div className="flex justify-between text-[10px] font-pixel text-ink/60 uppercase mb-2">
            <span>Progress to completion</span>
            <span className="text-ink">{percentFilled.toFixed(2)}%</span>
          </div>
          <div className="h-4 bg-grid-line rounded-full overflow-hidden border border-ink/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(percentFilled, 1)}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="h-full bg-gradient-to-r from-yellow via-orange to-red"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
