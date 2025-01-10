import { GlossaryRole } from "./types";

interface StatsCardsProps {
  glossaryData: GlossaryRole[];
}

export function StatsCards({ glossaryData }: StatsCardsProps) {
  // Calculate engagement metrics
  const totalActiveUsers = glossaryData[0]?.total_active_users || 0;
  const activeRoles = glossaryData.filter(role => role.active_users > 0).length;
  const highEngagementRoles = glossaryData.filter(role => {
    const hasActivity = role.active_users > 0;
    const hasQuality = role.avg_quality_score > 30;
    return hasActivity && hasQuality;
  }).length;

  return (
    <div className="desktop:flex desktop:flex-col desktop:gap-4">
      <div className="flex desktop:flex-col justify-between desktop:justify-start gap-6 desktop:gap-4">
        <div className="flex flex-col items-start">
          <div className="text-muted-foreground text-sm">Active Users</div>
          <div className="text-2xl font-semibold tabular-nums">
            {totalActiveUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground/50 text-sm">
            Beras active in 30 days 🐻
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="text-muted-foreground text-sm">Active Roles</div>
          <div className="text-2xl font-semibold tabular-nums">
            {activeRoles}
          </div>
          <div className="text-muted-foreground/50 text-sm">
            Roles with activity 🍯
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="text-muted-foreground text-sm">Elite Roles</div>
          <div className="text-2xl font-semibold tabular-nums">
            {highEngagementRoles}
          </div>
          <div className="text-muted-foreground/50 text-sm">
            High engagement roles 🔥
          </div>
        </div>
      </div>
    </div>
  );
} 