import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-pixel text-[10px] uppercase tracking-wider",
    "border-2 border-ink rounded-[8px]",
    "shadow-hard-sm",
    "px-3 py-1.5",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-yellow text-ink",
        secondary: "bg-white text-ink",
        info: "bg-white text-blue border-blue",
        muted: "bg-grid-line text-ink border-grid-line shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(chipVariants({ variant, className }))}
      {...props}
    />
  )
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
