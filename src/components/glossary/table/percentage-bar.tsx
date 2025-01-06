"use client";

interface PercentageBarProps {
  percentage: number;
  totalCount: number;
}

export function PercentageBar({ percentage, totalCount }: PercentageBarProps) {
  return (
    <div 
      className="w-32 h-2 bg-N900 rounded-full overflow-hidden"
      aria-label={`${percentage}% of ${totalCount} total users`}
      title={`${percentage}% of ${totalCount} total users`}
    >
      <div 
        className="h-full bg-theme rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, percentage)}%` }}
      />
    </div>
  );
} 