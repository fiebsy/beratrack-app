"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // Base styles
      "z-50 overflow-hidden rounded-md border bg-popover px-4 py-3 shadow-md",
      // Animation
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      // Text and sizing
      "text-sm text-popover-foreground max-w-[300px]",
      // Layout
      "flex flex-col gap-1.5",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Export styled components
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

// Export helper components for consistent tooltip content structure
interface TooltipTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function TooltipTitle({ children, className }: TooltipTitleProps) {
  return (
    <div className={cn("font-medium text-sm leading-tight", className)}>
      {children}
    </div>
  )
}

export function TooltipDescription({ children, className }: TooltipTitleProps) {
  return (
    <div className={cn("text-xs text-muted-foreground leading-normal", className)}>
      {children}
    </div>
  )
} 