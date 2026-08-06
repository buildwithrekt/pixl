"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white border-[2.5px] border-ink rounded-[14px] shadow-hard-lg",
            "w-full max-w-lg max-h-[90vh] overflow-auto",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModalHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-6 pt-6 pb-4 border-b border-grid-line", className)}>
      {children}
    </div>
  )
}

export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "px-6 pb-6 pt-4 border-t border-grid-line flex items-center justify-end gap-3",
        className
      )}
    >
      {children}
    </div>
  )
}
