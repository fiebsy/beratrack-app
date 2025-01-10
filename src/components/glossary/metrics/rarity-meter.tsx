import { cn } from "@/lib/utils";

interface RarityMeterProps {
  score: number;
  className?: string;
}

export function RarityMeter({ score, className }: RarityMeterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-theme transition-all" 
          style={{ width: `${Math.min(100, score)}%` }} 
        />
      </div>
      <span className="text-sm font-mono text-muted-foreground">
        {score.toFixed(1)}
      </span>
    </div>
  );
} 