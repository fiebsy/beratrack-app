"use client";

import { cn } from "@/lib/utils";
import { UserCheck, Skull, LockSimple, Question } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleStatusProps {
  type: "OPEN" | "CLOSED" | "RESTRICTED" | "UNCLEAR";
  variant?: "default" | "badge";
}

export function RoleStatus({ type, variant = "default" }: RoleStatusProps) {
  const getStatusIcon = () => {
    switch (type) {
      case "OPEN":
        return <UserCheck size={20} weight="fill" className="text-GNEON" />;
      case "CLOSED":
        return <Skull size={20} weight="fill" className="text-RNEON" />;
      case "RESTRICTED":
        return <LockSimple size={20} weight="fill" className="text-[#FFA500]" />;
      case "UNCLEAR":
      default:
        return <Question size={20} weight="regular" className="text-[#71717A]" />;
    }
  };

  const getStatusText = () => {
    switch (type) {
      case "OPEN":
        return "YO BERAS! This role is up for grabs fr fr 🐻";
      case "CLOSED":
        return "Closed role - no new members being added rn 🔒";
      case "RESTRICTED":
        return "Special access only - keep grinding fam 🔒";
      case "UNCLEAR":
      default:
        return "brb figuring out the requirements (UH OHHH) ❓";
    }
  };

  // Base component with icon and tooltip
  const IconWithTooltip = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Status badge component
  const StatusBadge = () => (
    <span className={cn(
      "text-[8px] tracking-[0.7px] leading-[18px] px-2 py-0 rounded uppercase",
      type === "OPEN" ? "bg-GNEON/10 text-GNEON/80" : 
      type === "CLOSED" ? "bg-RNEON/10 text-RNEON/80" : 
      type === "RESTRICTED" ? "bg-[#FFA500]/10 text-[#FFA500]/80" : 
      "bg-muted text-muted-foreground"
    )}>
      {type.toLowerCase()}
    </span>
  );

  if (variant === "badge") {
    // For dialog header: show both icon and badge
    return (
      <div className="flex items-center gap-2">
        <IconWithTooltip />
        <StatusBadge />
      </div>
    );
  }

  // For table view: show icon for all, badge only for OPEN (now on the left)
  return (
    <div className="flex items-center gap-2">
      {type === "OPEN" && <StatusBadge />}
      <IconWithTooltip />
    </div>
  );
} 