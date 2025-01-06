import { GlossaryRole } from "./types";

interface StatsCardsProps {
  glossaryData: GlossaryRole[];
}

export function StatsCards({ glossaryData }: StatsCardsProps) {
  // Calculate engagement metrics
  const totalDiscordUsers = glossaryData[0]?.total_users || 0;
  const totalActiveUsers = glossaryData[0]?.total_active_users || 0;
  const activeRoles = glossaryData.filter(role => role.active_users > 0).length;
  const highEngagementRoles = glossaryData.filter(role => {
    const hasActivity = role.active_users > 0;
    const hasQuality = role.avg_quality_score > 30;
    return hasActivity && hasQuality;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium text-muted-foreground">Total Discord Users</div>
        <div className="text-2xl font-bold">{totalDiscordUsers.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground mt-1">
          All users in Discord
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium text-muted-foreground">Active Users</div>
        <div className="text-2xl font-bold">{totalActiveUsers.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground mt-1">
          Users active in last 30 days
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium text-muted-foreground">Active Roles</div>
        <div className="text-2xl font-bold">{activeRoles}</div>
        <div className="text-sm text-muted-foreground mt-1">
          Roles with recent activity
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium text-muted-foreground">High Engagement</div>
        <div className="text-2xl font-bold">{highEngagementRoles}</div>
        <div className="text-sm text-muted-foreground mt-1">
          Roles with quality score &gt; 30
        </div>
      </div>
    </div>
  );
} 