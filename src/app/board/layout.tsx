import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Board",
  description: "Select your zone on the PIXELBOARD canvas. Claim pixels, pay with $PIXEL tokens.",
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
