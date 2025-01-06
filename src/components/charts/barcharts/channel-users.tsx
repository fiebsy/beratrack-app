'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getChannelDisplayName, getFullChannelName } from '@/lib/translations';

interface ChannelUsersProps {
  data: {
    channelName: string;
    uniqueAuthors: number;
    avgDailyAuthors: number;
    newAuthors: number;
    returningAuthors: number;
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      channelName?: string;
      originalName?: string;
      newAuthors?: number;
      returningAuthors?: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const dailyUsers = payload[0].value;
  const channelName = payload[0].payload.originalName || payload[0].payload.channelName;
  const newUsers = payload[0].payload.newAuthors;
  const returningUsers = payload[0].payload.returningAuthors;

  return (
    <div className="rounded-lg border border-white/10 bg-background p-3 shadow-sm">
      <div className="text-xs text-muted-foreground mb-2">
        {channelName ? getFullChannelName(channelName) : label}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="font-medium">{dailyUsers.toLocaleString()} avg daily users</span>
        </div>
        {newUsers !== undefined && (
          <div className="text-xs text-muted-foreground">
            {newUsers.toLocaleString()} new • {returningUsers?.toLocaleString()} returning
          </div>
        )}
      </div>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function ChannelUsers({ data }: ChannelUsersProps) {
  const chartData = React.useMemo(() => {
    return (data?.map(channel => ({
      ...channel,
      channelName: getChannelDisplayName(channel.channelName),
      originalName: channel.channelName
    })).sort((a, b) => b.avgDailyAuthors - a.avgDailyAuthors)) || [];
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Daily Active Users by Channel (7D)</h3>
      <div className="flex justify-start items-start h-[1200px] w-full overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
            layout="vertical"
            barSize={20}
          >
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatValue}
            />
            <YAxis 
              type="category"
              dataKey="channelName"
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              width={100}
              interval={0}
            />
            <Tooltip 
              content={<CustomTooltip />}
              isAnimationActive={false}
              cursor={{ fill: '#fff', opacity: 0.1 }}
            />
            <Bar 
              dataKey="avgDailyAuthors" 
              fill="#fff"
              fillOpacity={0.8}
              radius={[0, 2, 2, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 