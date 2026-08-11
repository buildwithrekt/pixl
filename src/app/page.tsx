import type { Metadata } from "next"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "BLOKR - Collaborative Pixel Canvas",
  description: "Claim your spot on the million pixel canvas. Buy zones with $BLOK tokens, all payments burned every 24 hours.",
}
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { Flywheel } from "@/components/flywheel"
import { StatsTicker } from "@/components/stats-ticker"
import { LiveStats } from "@/components/live-stats"
import { FeaturedZones } from "@/components/featured-zones"
import { BoardPreview } from "@/components/board-preview"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1">
        <Hero />
        <StatsTicker />
        <Flywheel />
        <LiveStats />
        <FeaturedZones />
        <HowItWorks />
      </div>
      <BoardPreview />
      <Footer />
    </main>
  )
}
