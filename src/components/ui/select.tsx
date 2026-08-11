"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none items-center justify-between",
            "rounded-[4px] border bg-gray-900 px-4 py-2 pr-10",
            "font-mono text-sm text-white",
            "border-gray-700",
            "transition-all duration-150",
            "focus:outline-none focus:border-lime focus:shadow-[0_0_0_3px_rgba(204,253,3,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-white/50 focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    )
  }
)
Select.displayName = "Select"

export interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn("bg-gray-900 text-white", className)}
        {...props}
      />
    )
  }
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
