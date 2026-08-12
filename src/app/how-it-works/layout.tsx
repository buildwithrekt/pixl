import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How it Works",
  description: "Learn how BLOKR works. Connect wallet, select zone, upload artwork, pay with $BLOKR, and claim your pixels forever.",
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
