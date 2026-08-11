import React from "react"

// Palette mapping for sprite characters
const PALETTE: Record<string, string> = {
  ".": "transparent",
  "R": "var(--red)",
  "O": "var(--orange)",
  "Y": "var(--yellow)",
  "C": "var(--cream)",
  "B": "var(--blue)",
  "K": "var(--ink)",
  "W": "#FFFFFF",
  "P": "var(--paper)",
}

interface SpriteProps {
  map: string[]
  pixelSize?: number
  mirror?: boolean
  className?: string
}

export function Sprite({
  map,
  pixelSize = 4,
  mirror = false,
  className,
}: SpriteProps) {
  const height = map.length
  const halfWidth = map[0]?.length || 0
  const fullWidth = mirror ? halfWidth * 2 : halfWidth

  const rects: React.ReactNode[] = []

  map.forEach((row, y) => {
    const chars = row.split("")
    chars.forEach((char, x) => {
      if (char !== "." && PALETTE[char]) {
        // Left side (original)
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={PALETTE[char]}
          />
        )
        // Mirror for symmetric sprites (right side)
        if (mirror) {
          const mirrorX = fullWidth - 1 - x
          rects.push(
            <rect
              key={`${mirrorX}-${y}-m`}
              x={mirrorX * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={PALETTE[char]}
            />
          )
        }
      }
    })
  })

  return (
    <svg
      width={fullWidth * pixelSize}
      height={height * pixelSize}
      viewBox={`0 0 ${fullWidth * pixelSize} ${height * pixelSize}`}
      className={className}
      style={{ shapeRendering: "crispEdges" }}
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

// Preset sprite maps
export const SPRITE_MAPS = {
  // Small pixel icons
  fire: [
    "..R..",
    ".ROR.",
    ".OYO.",
    "ROYYR",
    "OCYCO",
    ".CCC.",
  ],

  check: [
    "....K",
    "...KK",
    "K.KK.",
    "KKK..",
    "KK...",
  ],

  cross: [
    "R...R",
    ".R.R.",
    "..R..",
    ".R.R.",
    "R...R",
  ],

  arrow: [
    "..K..",
    ".KKK.",
    "KKKKK",
    "..K..",
    "..K..",
  ],
}
