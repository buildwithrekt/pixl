import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Board",
  description: "Select your zone on the BLOKR canvas. Claim pixels, pay with $BLOKR tokens.",
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
