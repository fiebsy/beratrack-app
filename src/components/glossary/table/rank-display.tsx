"use client";

import { Trophy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface RankDisplayProps {
  rank: number;
  total: number;
  className?: string;
}

export function RankDisplay({ rank, total, className }: RankDisplayProps) {
  // Calculate percentile (reversed since #1 is best)
  const percentile = ((total - rank + 1) / total) * 100;
  
  // Determine color and text based on percentile
  const getStyle = () => {
    if (percentile >= 90) return { color: "text-amber-500", text: "TOP TIER" };
    if (percentile >= 70) return { color: "text-emerald-500", text: "HIGH KEY" };
    if (percentile >= 50) return { color: "text-sky-500", text: "BASED" };
    if (percentile >= 30) return { color: "text-violet-500", text: "WAGMI" };
    return { color: "text-muted-foreground", text: "GRINDING" };
  };
  
  const style = getStyle();
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Trophy weight="fill" className={cn("w-3.5 h-3.5", style.color)} />
      <span className={cn("text-xs font-medium", style.color)}>
        #{rank.toLocaleString()}
      </span>
      <span className="text-xs text-muted-foreground">
        / {total.toLocaleString()} ({style.text})
      </span>
    </div>
  );
} 