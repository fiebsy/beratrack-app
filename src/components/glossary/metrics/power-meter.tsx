import { cn } from "@/lib/utils";

interface PowerMeterProps {
  level: number;
  color?: string;
  variant?: "default" | "large";
}

export function PowerMeter({ 
  level, 
  color = "text-muted-foreground",
  variant = "default" 
}: PowerMeterProps) {
  const sizes = {
    default: {
      container: "gap-1 w-[60px]",
      bar: "w-full h-5",
    },
    large: {
      container: "gap-2 w-full max-w-[200px]",
      bar: "w-full h-12",
    }
  };

  const size = sizes[variant];

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