import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    "bg-gray-900 border border-gray-700 rounded-[6px]",
    "transition-all duration-200 ease-out",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        glow: "hover:border-lime-dim hover:shadow-[0_0_20px_rgba(204,253,3,0.15)]",
        interactive: [
          "cursor-pointer",
          "hover:border-lime hover:shadow-[0_0_25px_rgba(204,253,3,0.2)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        outline: "bg-transparent border-gray-600",
        ghost: "bg-transparent border-transparent",
      },
      // Kept for backward compatibility
      shadow: {
        red: "hover:shadow-[0_0_20px_rgba(204,253,3,0.15)]",
        blue: "hover:shadow-[0_0_20px_rgba(204,253,3,0.15)]",
        yellow: "hover:shadow-[0_0_20px_rgba(204,253,3,0.15)]",
        lime: "hover:shadow-[0_0_20px_rgba(204,253,3,0.15)]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      shadow: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, shadow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, shadow, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-mono text-xs uppercase tracking-wider text-gray-400",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
