'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getChannelDisplayName, getFullChannelName } from '@/lib/translations';

interface ChannelActivityProps {
  data: {
    channelName: string;
    messageCount: number;
    avgDailyMessages: number;
    activeDays: number;
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      channelName?: string;
      originalName?: string;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const messages = payload[0].value;
  const channelName = payload[0].payload.originalName || payload[0].payload.channelName;

  return (
    <div className="rounded-lg border border-white/10 bg-background p-3 shadow-sm">
      <div className="text-xs text-muted-foreground mb-2">
        {channelName ? getFullChannelName(channelName) : label}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-white" />
        <span className="font-medium">{messages.toLocaleString()} avg/day</span>
      </div>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function ChannelMessageVolume({ data }: ChannelActivityProps) {
  const chartData = React.useMemo(() => {
    return (data?.map(channel => ({
      ...channel,
      channelName: getChannelDisplayName(channel.channelName),
      originalName: channel.channelName // Keep original name for tooltip
    })).sort((a, b) => b.avgDailyMessages - a.avgDailyMessages)) || [];
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Message Volume by Channel (7D)</h3>
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
              dataKey="avgDailyMessages" 
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