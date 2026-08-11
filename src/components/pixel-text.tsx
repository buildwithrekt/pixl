import React from "react"
import { cn } from "@/lib/utils"

interface PixelTextProps {
  text: string
  className?: string
}

const COLORS = ["text-lime", "text-white", "text-lime", "text-white"]

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
