import * as React from "react"
import { cn } from "@/lib/utils"

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center",
        "font-pixel text-[11px] uppercase tracking-wider",
        "text-blue bg-white border-2 border-blue rounded-full",
        "px-4 py-2",
        className
      )}
      {...props}
    />
  )
)
Eyebrow.displayName = "Eyebrow"

export { Eyebrow }
