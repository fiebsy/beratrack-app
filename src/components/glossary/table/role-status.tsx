"use client";

import { UserCheck, LockSimple, Question, Skull } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipTitle,
} from "@/components/ui/tooltip";

interface RoleStatusProps {
  type: string;
}

export function RoleStatus({ type }: RoleStatusProps) {
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-start gap-3 w-fit">
          {type === "OPEN" && (
              <span className="text-[8px] tracking-[0.7px] leading-[18px] px-2 py-0 bg-[#0BFF27]/10 text-[#0BFF27]/80 rounded uppercase">
                OPEN
              </span>
            )}
            {getStatusIcon()}

          </div>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipTitle>{getStatusText()}</TooltipTitle>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 