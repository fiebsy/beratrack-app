"use client";

interface PercentageBarProps {
  percentage: number;
  totalCount: number;
  variant?: "default" | "large";
}

export function PercentageBar({ 
  percentage, 
  totalCount,
  variant = "large" 
}: PercentageBarProps) {
  // Ensure at least 2% width for visibility
  const minWidth = 2;
  const displayWidth = percentage > 0 ? Math.max(minWidth, Math.min(100, percentage)) : 0;

  const sizes = {
    default: {
      container: "w-[60px] h-5",
      clip: "polygon(0 3px, 3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)"
    },
    large: {
      container: "w-full max-w-[200px] h-12",
      clip: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
    }
  };

  const size = sizes[variant];

  return (
    <div 
      className={`${size.container} bg-N900 overflow-hidden border border-muted-foreground/20`}
      aria-label={`${percentage}% of ${totalCount} total users`}
      title={`${percentage}% of ${totalCount} total users`}
      style={{
        clipPath: size.clip
      }}
    >
      <div 
        className="h-full bg-theme transition-all duration-300"
        style={{ 
          width: `${displayWidth}%`,
          clipPath: size.clip
        }}
      />
    </div>
  );
} 