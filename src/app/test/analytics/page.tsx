import { getDailyMessageCounts, getChannelMessageCounts, getChannelUserStats, getChannelEngagementStats } from '@/lib/bigquery/client';
import { OverallActivity } from '@/components/charts/barcharts/overall-activity';
import { ChannelMessageVolume } from '@/components/charts/barcharts/channel-activity';
import { ChannelUsers } from '@/components/charts/barcharts/channel-users';
import { ChannelEngagement } from '@/components/charts/barcharts/channel-engagement';

export default async function Home() {
  const [dailyStats, messageStats, userStats, engagementStats] = await Promise.all([
    getDailyMessageCounts(7),
    getChannelMessageCounts(),
    getChannelUserStats(),
    getChannelEngagementStats()
  ]);

  return (
    <main className="container mx-auto p-4 space-y-8">
      <OverallActivity data={dailyStats} />
      <ChannelMessageVolume data={messageStats} />
      <ChannelUsers data={userStats} />
      <ChannelEngagement data={engagementStats} />
    </main>
  );
}
