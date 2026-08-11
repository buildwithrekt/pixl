import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-mono text-[10px] uppercase tracking-wider",
    "border rounded-[4px]",
    "px-2 py-0.5",
    "transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-lime text-black border-lime",
        secondary: "bg-gray-800 text-gray-300 border-gray-700",
        outline: "bg-transparent text-lime border-lime",
        muted: "bg-gray-900 text-gray-500 border-gray-800",
        success: "bg-lime/10 text-lime border-lime/50",
        destructive: "bg-red-500/10 text-red-400 border-red-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
