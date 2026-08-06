"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/providers/theme-provider"
import { Sprite, SPRITE_MAPS } from "@/lib/sprites"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-3 py-1.5 bg-ink rounded-full border-2 border-ink hover:bg-ink/90 transition-colors"
      aria-label={`Switch to ${theme === "fire" ? "frog" : "fire"} theme`}
    >
      {/* Fire icon */}
      <motion.div
        animate={{
          opacity: theme === "fire" ? 1 : 0.3,
          scale: theme === "fire" ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <Sprite map={SPRITE_MAPS.fire} pixelSize={3} />
      </motion.div>

      {/* Toggle track */}
      <div className="relative w-10 h-5 bg-paper/20 rounded-full">
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-paper"
          animate={{
            left: theme === "fire" ? "2px" : "22px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>

      {/* Frog icon */}
      <motion.div
        animate={{
          opacity: theme === "frog" ? 1 : 0.3,
          scale: theme === "frog" ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <Sprite map={SPRITE_MAPS.frog} pixelSize={3} />
      </motion.div>
    </button>
  )
}
