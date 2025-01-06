import { User } from "@phosphor-icons/react";

interface RarityMeterProps {
  activeUsers: number;
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

export function RarityMeter({ activeUsers }: RarityMeterProps) {
  return (
    <div className="flex items-center gap-[6px]">
      <User weight="fill" className="w-[14px] h-[14px] text-muted-foreground/50" />
      <div className="text-sm text-muted-foreground font-mono">
        {formatNumber(activeUsers)}
      </div>
    </div>
  );
} 