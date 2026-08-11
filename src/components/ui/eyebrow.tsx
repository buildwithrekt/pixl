import * as React from "react"
import { cn } from "@/lib/utils"

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center",
        "font-mono text-[11px] uppercase tracking-wider",
        "text-lime border border-lime rounded-[4px]",
        "px-3 py-1",
        className
      )}
      {...props}
    />
  )
)
Eyebrow.displayName = "Eyebrow"

export { Eyebrow }
