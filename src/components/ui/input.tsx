import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "flex w-full",
    "font-mono text-sm",
    "bg-gray-900 text-white",
    "border border-gray-700 rounded-[4px]",
    "placeholder:text-gray-500",
    "transition-all duration-150",
    "focus:outline-none focus:border-lime focus:shadow-[0_0_0_3px_rgba(204,253,3,0.15)]",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-gray-800",
    "file:border-0 file:bg-transparent file:text-sm file:font-mono file:text-lime",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        ghost: "bg-transparent border-transparent focus:bg-gray-900 focus:border-gray-700",
        error: "border-white/50 focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)]",
      },
      inputSize: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Textarea component
const textareaVariants = cva(
  [
    "flex w-full min-h-[100px]",
    "font-mono text-sm",
    "bg-gray-900 text-white",
    "border border-gray-700 rounded-[4px]",
    "placeholder:text-gray-500",
    "transition-all duration-150",
    "focus:outline-none focus:border-lime focus:shadow-[0_0_0_3px_rgba(204,253,3,0.15)]",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-gray-800",
    "resize-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        ghost: "bg-transparent border-transparent focus:bg-gray-900 focus:border-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant }), "px-4 py-3", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Label component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "font-mono text-xs uppercase tracking-wider text-gray-400",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Input, inputVariants, Textarea, textareaVariants, Label }
