import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse all claimed zones on the BLOKR canvas. Explore pixel art, search by wallet address, and discover projects.",
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
