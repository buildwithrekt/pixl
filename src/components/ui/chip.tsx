import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-mono text-[10px] uppercase tracking-wider",
    "border rounded-[4px]",
    "px-2.5 py-1",
    "transition-colors duration-150",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-transparent text-lime border-lime",
        secondary: "bg-gray-800 text-gray-300 border-gray-700",
        muted: "bg-gray-900 text-gray-500 border-gray-800",
        highlight: "bg-lime text-black border-lime",
        info: "bg-transparent text-gray-400 border-gray-600",
        success: "bg-lime/10 text-lime border-lime/50",
      },
      size: {
        default: "text-[10px] px-2.5 py-1",
        sm: "text-[9px] px-2 py-0.5",
        lg: "text-[11px] px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(chipVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
