import React from "react"
import { cn } from "@/lib/utils"

interface PixelTextProps {
  text: string
  className?: string
}

const COLORS = ["text-red", "text-blue", "text-orange", "text-ink"]

export function PixelText({ text, className }: PixelTextProps) {
  return (
    <span className={cn("font-pixel", className)}>
      {text.split("").map((char, i) => (
        <span key={i} className={COLORS[i % COLORS.length]}>
          {char}
        </span>
      ))}
    </span>
  )
}
