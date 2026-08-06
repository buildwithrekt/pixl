import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-body font-medium text-sm whitespace-nowrap",
    "border-2 border-ink",
    "transition-all duration-0",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-red text-white",
          "shadow-hard-md",
          "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--ink)]",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--ink)]",
        ].join(" "),
        secondary: [
          "bg-white text-ink",
          "shadow-hard-md",
          "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--ink)]",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--ink)]",
        ].join(" "),
        ghost: [
          "border-transparent",
          "bg-transparent text-ink",
          "hover:bg-grid-line",
        ].join(" "),
        link: [
          "border-transparent",
          "text-blue underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-10 px-6 py-2 rounded-[8px]",
        sm: "h-8 px-4 text-xs rounded-[8px]",
        lg: "h-12 px-8 text-base rounded-[10px]",
        icon: "h-10 w-10 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
