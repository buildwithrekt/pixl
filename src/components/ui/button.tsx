import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-mono text-sm font-medium uppercase tracking-wide whitespace-nowrap",
    "rounded-[4px]",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-lime text-black border border-lime",
          "hover:bg-lime/80 hover:shadow-[0_0_20px_rgba(204,253,3,0.4)]",
          "active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "bg-gray-900 text-white border border-gray-700",
          "hover:border-lime hover:text-lime hover:shadow-[0_0_15px_rgba(204,253,3,0.2)]",
          "active:scale-[0.98]",
        ].join(" "),
        outline: [
          "bg-transparent text-lime border border-lime",
          "hover:bg-lime hover:text-black hover:shadow-[0_0_20px_rgba(204,253,3,0.4)]",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "bg-transparent text-gray-400 border border-transparent",
          "hover:text-lime hover:border-gray-700",
        ].join(" "),
        link: [
          "bg-transparent text-lime border-none",
          "hover:text-white hover:underline underline-offset-4",
        ].join(" "),
        destructive: [
          "bg-transparent text-red-500 border border-red-500/50",
          "hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base rounded-[6px]",
        icon: "h-10 w-10",
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
