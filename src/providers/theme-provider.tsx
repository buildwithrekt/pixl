"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Theme = "fire" | "frog"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("fire")
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("pixelboard-theme") as Theme | null
    if (savedTheme && (savedTheme === "fire" || savedTheme === "frog")) {
      setThemeState(savedTheme)
    }
    setMounted(true)
  }, [])

  // Apply theme class to html element
  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement
    if (theme === "frog") {
      html.classList.add("theme-frog")
    } else {
      html.classList.remove("theme-frog")
    }

    localStorage.setItem("pixelboard-theme", theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "fire" ? "frog" : "fire"))
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  // Return default values during SSR/SSG when provider isn't available
  if (context === undefined) {
    return {
      theme: "fire" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return context
}
