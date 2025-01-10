"use client";

import { Trophy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface RankDisplayProps {
  rank: number;
  total: number;
  size?: "sm" | "md" | "lg";
}

export function RankDisplay({ rank, total, size = "md" }: RankDisplayProps) {
  const isTop10 = rank <= 10;
  const isTop50 = rank <= 50;
  const isTop100 = rank <= 100;

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center gap-1", sizes[size])}>
      <Trophy
        weight={isTop10 ? "fill" : isTop50 ? "duotone" : "regular"}
        className={cn(
          "transition-colors",
          isTop10 ? "text-yellow-400" :
          isTop50 ? "text-yellow-500/50" :
          isTop100 ? "text-yellow-600/30" :
          "text-muted-foreground/30"
        )}
      />
      <span className="font-mono">
        #{rank}
      </span>
      {isTop10 && <span className="text-yellow-400">(TOP 10)</span>}
      {!isTop10 && isTop50 && <span className="text-yellow-500/50">(TOP 50)</span>}
      {!isTop50 && isTop100 && <span className="text-yellow-600/30">(TOP 100)</span>}
    </div>
  );
} 