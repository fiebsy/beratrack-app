import { cn } from "@/lib/utils";
import { Trophy } from "@phosphor-icons/react";

interface RarityMeterProps {
  percentage: number;
  variant?: "default" | "large";
}

export function RarityMeter({ percentage, variant = "default" }: RarityMeterProps) {
  // Calculate rarity level (1-5)
  const level = Math.max(1, Math.min(5, Math.ceil(
    percentage >= 20 ? 1 :  // Most common (20%+)
    percentage >= 10 ? 2 :  // Common (10-20%)
    percentage >= 5 ? 3 :   // Uncommon (5-10%)
    percentage >= 1 ? 4 :   // Rare (1-5%)
    5                       // Ultra Rare (<1%)
  )));

  const sizes = {
    default: {
      container: "gap-1 w-[60px]",
      bar: "w-full h-5",
    },
    large: {
      container: "gap-2 w-[200px]",
      bar: "w-full h-12",
    }
  };

  const size = sizes[variant];

  // Get color based on rarity level
  const color = level === 5 ? "text-fuchsia-500" :
                level === 4 ? "text-purple-500" :
                level === 3 ? "text-blue-500" :
                level === 2 ? "text-green-500" :
                "text-gray-500";

  return (
    <div className={cn("flex", size.container)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            size.bar,
            "border border-muted-foreground/20 transition-all duration-150",
            i < level ? `${color} bg-current` : "bg-muted"
          )}
          style={{
            clipPath: "polygon(0 3px, 3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)"
          }}
        />
      ))}
    </div>
  );
} 