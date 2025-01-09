import { User, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface RarityMeterProps {
  activeUsers: number;
  additions?: number;
  removals?: number;
  lastAdditionDate?: string;
  lastRemovalDate?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function RarityMeter({ activeUsers, additions = 0, removals = 0 }: RarityMeterProps) {
  const hasChanges = additions > 0 || removals > 0;
  const netChange = additions - removals;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-[6px]">
        <User weight="fill" className="w-[14px] h-[14px] text-muted-foreground/50" />
        <div className="text-sm text-muted-foreground font-mono">
          {formatNumber(activeUsers)}
        </div>
      </div>

      {hasChanges && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-mono",
          netChange > 0 ? "text-GNEON/80" : netChange < 0 ? "text-RNEON/80" : "text-muted-foreground"
        )}>
          {netChange > 0 ? (
            <>
              <ArrowUp weight="bold" className="w-3 h-3" />
              <span>{formatNumber(netChange)}</span>
            </>
          ) : netChange < 0 ? (
            <>
              <ArrowDown weight="bold" className="w-3 h-3" />
              <span>{formatNumber(Math.abs(netChange))}</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
} 