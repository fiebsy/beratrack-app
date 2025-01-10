"use client";

import { GlossaryRole } from "./types";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

const roleTypes = [
  { label: "All", value: "" },
  { label: "NFT", value: "NFT" },
  { label: "Community", value: "COMMUNITY" },
  { label: "Service", value: "SERVICE" },
  { label: "System", value: "SYSTEM" },
  { label: "Team", value: "TEAM" },
];

interface RoleFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RoleFilter({ value, onChange, className }: RoleFilterProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-x-auto scrollbar-none [&::-webkit-scrollbar]{display:none} [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-fit">
          <SegmentedControl
            options={roleTypes}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

export function filterRolesByType(roles: GlossaryRole[], type: string): GlossaryRole[] {
  if (!type) return roles;
  return roles.filter(role => role.badge === type);
} 