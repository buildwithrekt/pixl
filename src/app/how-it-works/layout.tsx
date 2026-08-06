import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How it Works",
  description: "Learn how PIXELBOARD works. Connect wallet, select zone, upload artwork, pay with $PIXEL, and claim your pixels forever.",
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
