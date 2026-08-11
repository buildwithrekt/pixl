import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recover Payment",
  description: "Lost your zone? Recover your BLOKR payment by entering your transaction hash.",
}

export default function RecoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
