'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OverallActivityProps {
  data: {
    timestamp: string;
    messageCount: number;
    isPartialDay: boolean;
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      isPartialDay?: boolean;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const messages = payload[0].value;
  const isPartialDay = payload[0].payload.isPartialDay;

  return (
    <div className="rounded-lg border border-white/10 bg-background p-3 shadow-sm">
      <div className="text-xs text-muted-foreground mb-2">
        {label}
        {isPartialDay && ' (In Progress)'}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-white" />
        <span className="font-medium">{messages.toLocaleString()} messages</span>
      </div>
    </div>
  );
}

function formatDate(timestamp: string): Date {
  const utcDate = new Date(timestamp);
  utcDate.setUTCDate(utcDate.getUTCDate() + 1);
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

function formatValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function OverallActivity({ data }: OverallActivityProps) {
  const chartData = React.useMemo(() => {
    return data.map(day => {
      const date = formatDate(day.timestamp);
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        total: day.messageCount,
        isPartialDay: day.isPartialDay
      };
    }).reverse(); // Show oldest to newest
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Total Messages (7D)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="date"
              interval={Math.floor(chartData.length / 4)}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatValue}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip 
              content={<CustomTooltip />}
              isAnimationActive={false}
              position={{ y: 10 }}
              cursor={{ fill: '#fff', opacity: 0.1 }}
            />
            <Bar 
              dataKey="total" 
              fill="#fff"
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 