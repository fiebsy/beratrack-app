"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react";

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  const filteredOptions = options.filter(option => option.value !== "");

  return (
    <div className={cn("flex items-center gap-2 relative h-[52px]", className)}>
      {/* All button - always visible with permanent styling */}
      <button
        onClick={() => onChange("")}
        className={cn(
          "h-[44px] px-6 text-sm font-normal rounded-full transition-all duration-100",
          "border border-muted-foreground",
          "text-foreground",
          value ? "opacity-40" : "bg-zinc-900"
        )}
      >
        All
      </button>

      {/* Other options - only show selected or all if none selected */}
      {filteredOptions
        .filter(option => !value || option.value === value)
        .map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value === value ? "" : option.value)}
            className={cn(
              "h-[44px] pl-6 pr-4 text-sm font-normal rounded-full transition-all flex items-center gap-2 duration-100",
              "text-muted-foreground hover:text-foreground",
              "border border-border/40",
              value === option.value
                ? "absolute left-[12px] scale-100 text-foreground border-muted-foreground bg-zinc-900"
                : "border-transparent bg-transparent scale-90"
            )}
          >
            {option.label}
            {value === option.value && (
              <X 
                weight="regular" 
                className="ml-2 w-4 h-4 text-foreground"
              />
            )}
          </button>
        ))}
    </div>
  );
} 