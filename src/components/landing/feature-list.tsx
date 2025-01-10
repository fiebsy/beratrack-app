'use client';

import { ArrowElbowDownRight } from "@phosphor-icons/react";
import { GlossaryRole } from "../glossary/types";

interface FeatureListProps {
  glossaryData: GlossaryRole[];
}

export function FeatureList({ glossaryData }: FeatureListProps) {
  // Calculate stats
  const totalActiveUsers = glossaryData[0]?.total_active_users || 0;
  const activeRoles = glossaryData.filter(role => role.active_users > 0).length;
  const eliteRoles = glossaryData.filter(role => role.avg_quality_score > 30).length;
  const openRoles = glossaryData.filter(role => role.attainability_type === "OPEN").length;
  const totalChanges = glossaryData.reduce((acc, role) => acc + (role.additions || 0) + (role.removals || 0), 0);
  const avgQuality = glossaryData.reduce((acc, role) => acc + role.avg_quality_score, 0) / glossaryData.length;

  return (
    <div className="mt-8 grid grid-cols-2 tablet:grid-cols-2 gap-y-6 gap-x-12">
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{totalActiveUsers.toLocaleString()}</p>
          <p className="text-muted-foreground text-sm">Active Beras</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{activeRoles}</p>
          <p className="text-muted-foreground text-sm">Active Roles</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{eliteRoles}</p>
          <p className="text-muted-foreground text-sm">Elite Roles</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{openRoles}</p>
          <p className="text-muted-foreground text-sm">Open Roles</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{totalChanges.toLocaleString()}</p>
          <p className="text-muted-foreground text-sm">Role Changes</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ArrowElbowDownRight className="mt-1 text-theme" size={20} weight="bold" />
        <div>
          <p className="text-xl font-mono text-theme">{avgQuality.toFixed(1)}</p>
          <p className="text-muted-foreground text-sm">Avg BASED</p>
        </div>
      </div>
    </div>
  );
} 