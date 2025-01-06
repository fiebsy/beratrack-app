'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getChannelDisplayName, getFullChannelName } from '@/lib/translations';

interface ChannelEngagementProps {
  data: {
    channelName: string;
    totalMessages: number;
    uniqueAuthors: number;
    avgReactionsPerMessage: number;
    avgRepliesPerMessage: number;
    messagesWithReactions: number;
    messagesWithReplies: number;
    threadsCreated: number;
    avgParticipantsPerThread: number;
    avgMessagesPerThread: number;
    engagementScore: number;
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      channelName?: string;
      originalName?: string;
      totalMessages?: number;
      uniqueAuthors?: number;
      avgReactionsPerMessage?: number;
      avgRepliesPerMessage?: number;
      messagesWithReactions?: number;
      messagesWithReplies?: number;
      threadsCreated?: number;
      avgParticipantsPerThread?: number;
      avgMessagesPerThread?: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const channelName = data.originalName || data.channelName;

  return (
    <div className="rounded-lg border border-white/10 bg-background p-3 shadow-sm">
      <div className="text-xs text-muted-foreground mb-2">
        {channelName ? getFullChannelName(channelName) : label}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="font-medium">{payload[0].value.toFixed(1)} engagement score</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.uniqueAuthors?.toLocaleString()} unique authors • {data.totalMessages?.toLocaleString()} messages
        </div>
        <div className="text-xs text-muted-foreground">
          {data.avgReactionsPerMessage?.toFixed(1)} reactions/msg • {data.avgRepliesPerMessage?.toFixed(1)} replies/msg
        </div>
        <div className="text-xs text-muted-foreground">
          {data.threadsCreated?.toLocaleString()} threads • {data.avgParticipantsPerThread?.toFixed(1)} participants/thread
        </div>
      </div>
    </div>
  );
}

function formatValue(value: number): string {
  return value.toFixed(1);
}

export function ChannelEngagement({ data }: ChannelEngagementProps) {
  const chartData = React.useMemo(() => {
    return (data?.map(channel => ({
      ...channel,
      channelName: getChannelDisplayName(channel.channelName),
      originalName: channel.channelName
    })).sort((a, b) => b.engagementScore - a.engagementScore)) || [];
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Channel Engagement Score (7D)</h3>
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
              domain={[0, 100]}
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
              dataKey="engagementScore" 
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