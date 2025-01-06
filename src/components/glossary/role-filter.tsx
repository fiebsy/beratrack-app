"use client";

import { GlossaryRole } from "./types";
import { SegmentedControl } from "@/components/ui/segmented-control";

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
    <SegmentedControl
      options={roleTypes}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}

export function filterRolesByType(roles: GlossaryRole[], type: string): GlossaryRole[] {
  if (!type) return roles;
  return roles.filter(role => role.badge === type);
} 