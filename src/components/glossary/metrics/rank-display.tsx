"use client";

import { cn } from "@/lib/utils";

interface RankDisplayProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg"
};

export function RankDisplay({ rank, size = "md", className }: RankDisplayProps) {
  return (
    <div className={cn(
      "font-mono",
      sizeClasses[size],
      className
    )}>
      #{rank}
    </div>
  );
} 