"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

interface Zone {
  id: string
  x: number
  y: number
  w: number
  h: number
  projectName: string | null
  imageUrl: string | null
  totalPixels?: number
}

export function FeaturedZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch("/api/zones?status=drawn&limit=4")
        if (res.ok) {
          const data = await res.json()
          setZones(data.zones?.slice(0, 4) || [])
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchZones()
  }, [])

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="font-mono text-[11px] text-lime uppercase tracking-wide">
              Featured
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-white mt-2">
              Recent artwork
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-800 rounded-[6px] border border-gray-700 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (zones.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16 px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
            <span className="font-mono text-[11px] text-lime uppercase tracking-wide">
              Featured
            </span>
            <Sprite map={SPRITE_MAPS.fire} pixelSize={4} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-white">
            Recent artwork
          </h2>
          <p className="text-gray-400 mt-2">
            Latest zones claimed on the board
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {zones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/zone/${zone.id}`}
                className="block bg-gray-900 border border-gray-700 rounded-[6px] overflow-hidden hover:border-lime hover:shadow-[0_0_20px_rgba(204,253,3,0.15)] hover:-translate-y-0.5 transition-all duration-150"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-800 relative">
                  {zone.imageUrl ? (
                    <img
                      src={zone.imageUrl}
                      alt={zone.projectName || "Zone artwork"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-[8px] text-gray-600 uppercase">
                        No image
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-mono text-[10px] text-white truncate">
                    {zone.projectName || `Zone (${zone.x}, ${zone.y})`}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {(zone.totalPixels ?? zone.w * zone.h * 64).toLocaleString()} px
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-lime hover:text-white uppercase transition-colors"
          >
            View all artwork
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
