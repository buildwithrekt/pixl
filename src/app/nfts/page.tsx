"use client"

import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const NFT_PREVIEWS = [
  { id: 1, src: "/nfts/1.png" },
  { id: 2, src: "/nfts/2.png" },
  { id: 3, src: "/nfts/3.png" },
  { id: 4, src: "/nfts/4.png" },
  { id: 5, src: "/nfts/5.png" },
  { id: 6, src: "/nfts/6.png" },
  { id: 7, src: "/nfts/7.png" },
  { id: 8, src: "/nfts/8.png" },
]

export default function NFTsPage() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider || isPaused) return

    let animationId: number
    let position = 0
    const speed = 0.5

    const animate = () => {
      position += speed
      if (position >= slider.scrollWidth / 2) {
        position = 0
      }
      slider.style.transform = `translateX(-${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Nav />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Eyebrow */}
        <span className="font-mono text-[11px] text-lime border border-lime px-3 py-1 rounded-[4px] uppercase mb-8">
          The Legend
        </span>

        {/* NFT Slider */}
        <div
          className="w-full max-w-5xl overflow-hidden mb-12 py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={sliderRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {/* Double the items for seamless loop */}
            {[...NFT_PREVIEWS, ...NFT_PREVIEWS].map((nft, index) => (
              <div
                key={`${nft.id}-${index}`}
                className="relative group flex-shrink-0"
              >
                <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-lg overflow-hidden border-2 border-lime/30 group-hover:border-lime transition-colors duration-200">
                  <Image
                    src={nft.src}
                    alt={`Blokr #${nft.id}`}
                    fill
                    className="object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                  {/* Lime overlay on hover */}
                  <div className="absolute inset-0 bg-lime/0 group-hover:bg-lime/10 transition-colors duration-200" />
                </div>
                {/* Label */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-lime/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-mono text-[10px] text-lime">#{nft.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="font-mono text-[10px] text-gray-600 mb-10 uppercase tracking-wider">
          Hover to pause
        </p>

        {/* Story */}
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Before the canvas, there were the <span className="text-lime">Blokrs</span>.
          </h1>

          <div className="space-y-4 text-gray-400 text-base md:text-lg leading-relaxed">
            <p>
              Silent guardians of the grid. Born from the first pixels ever minted on Robinhood Chain,
              they wandered the empty blocks for cycles—waiting.
            </p>
            <p>
              Legend says each Blokr carries a fragment of the original canvas.
              A memory of what was, and a key to what will be.
            </p>
            <p>
              When the 1,024 × 1,024 board fills completely, they will awaken.
              Those who hold them will decide the fate of the final masterpiece.
            </p>
          </div>

          {/* Teaser */}
          <div className="pt-8 border-t border-gray-800 mt-8">
            <p className="font-mono text-sm text-lime uppercase tracking-wider">
              2,048 Blokrs. One destiny.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Collection coming soon.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
