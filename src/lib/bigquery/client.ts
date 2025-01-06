import { BigQuery } from '@google-cloud/bigquery';

// Initialize BigQuery client with environment-aware configuration
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'pickaxe-dashboard',
  ...(process.env.VERCEL
    ? {
        // In Vercel, use the environment variable containing the full service account JSON
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}')
      }
    : {
        // In local development, use the service account file
        keyFilename: './service-account.json'
      }),
  location: 'US'
});

export interface ChannelStats {
  channelName: string;
  messageCount: number;
  uniqueAuthors: number;
}

export interface DailyMessageCount {
  timestamp: string; // UTC timestamp
  messageCount: number;
  isPartialDay: boolean;
}

export async function getDailyMessageCounts(days: number) {
  const query = `
    WITH daily_stats AS (
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as messageCount
      FROM discord_berachain.messages
      WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
      GROUP BY date
    )
    SELECT 
      date,
      messageCount,
      date = CURRENT_DATE() as isPartialDay
    FROM daily_stats
    ORDER BY date DESC
  `;

  const options = {
    query,
    params: { days }
  };

  const [rows] = await bigquery.query(options);
  return rows.map(row => ({
    timestamp: row.date.value,
    messageCount: Number(row.messageCount),
    isPartialDay: Boolean(row.isPartialDay)
  }));
}

export async function getChannelMessageCounts() {
  const query = `
    WITH channel_stats AS (
      SELECT 
        cm.channel_name as channelName,
        COUNT(*) as totalMessages,
        ROUND(COUNT(*) / 7, 1) as avgDailyMessages,
        COUNT(DISTINCT DATE(timestamp)) as activeDays
      FROM discord_berachain.messages m
      JOIN discord_berachain.channel_metadata cm ON m.channel_id = cm.channel_id
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY cm.channel_name
      HAVING avgDailyMessages > 0
    )
    SELECT 
      channelName,
      totalMessages,
      avgDailyMessages,
      activeDays
    FROM channel_stats
    ORDER BY avgDailyMessages DESC
  `;

  const [rows] = await bigquery.query({ query });
  return rows.map(row => ({
    channelName: row.channelName,
    messageCount: Number(row.totalMessages),
    avgDailyMessages: Number(row.avgDailyMessages),
    activeDays: Number(row.activeDays)
  }));
}

export async function getTopChannelStats(days: number = 7): Promise<ChannelStats[]> {
  const query = `
    SELECT 
      cm.channel_name as channelName,
      COUNT(*) as messageCount,
      COUNT(DISTINCT author_id) as uniqueAuthors
    FROM discord_berachain.messages m
    LEFT JOIN discord_berachain.channel_metadata cm 
      ON m.channel_id = cm.channel_id
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
    GROUP BY cm.channel_name
    ORDER BY messageCount DESC
    LIMIT 5
  `;

  const options = {
    query,
    params: { days }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows as ChannelStats[];
  } catch (error) {
    console.error('BigQuery Error:', error);
    throw error;
  }
}

export async function getTotalStats(days: number = 7) {
  const query = `
    SELECT 
      COUNT(*) as totalMessages,
      COUNT(DISTINCT author_id) as totalAuthors,
      COUNT(DISTINCT m.channel_id) as totalChannels
    FROM discord_berachain.messages m
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
  `;

  const options = {
    query,
    params: { days }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows[0];
  } catch (error) {
    console.error('BigQuery Error:', error);
    throw error;
  }
}

export async function getChannelUserStats() {
  const query = `
    WITH daily_users AS (
      SELECT 
        channel_id,
        DATE(timestamp) as date,
        COUNT(DISTINCT author_id) as daily_authors,
        COUNTIF(is_first_message) as new_authors
      FROM (
        SELECT 
          m.*,
          MIN(DATE(timestamp)) OVER (PARTITION BY author_id) = DATE(timestamp) as is_first_message
        FROM discord_berachain.messages m
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      )
      GROUP BY channel_id, date
    ),
    channel_stats AS (
      SELECT 
        cm.channel_name,
        AVG(du.daily_authors) as avg_daily_authors,
        COUNT(DISTINCT m.author_id) as unique_authors,
        SUM(du.new_authors) as new_authors,
        COUNT(DISTINCT m.author_id) - SUM(du.new_authors) as returning_authors
      FROM discord_berachain.messages m
      JOIN discord_berachain.channel_metadata cm ON m.channel_id = cm.channel_id
      LEFT JOIN daily_users du ON m.channel_id = du.channel_id
      WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY cm.channel_name
      HAVING avg_daily_authors > 0
    )
    SELECT *
    FROM channel_stats
    ORDER BY avg_daily_authors DESC
  `;

  const [rows] = await bigquery.query({ query });
  return rows.map(row => ({
    channelName: row.channel_name,
    uniqueAuthors: Number(row.unique_authors),
    avgDailyAuthors: Number(row.avg_daily_authors),
    newAuthors: Number(row.new_authors),
    returningAuthors: Number(row.returning_authors)
  }));
}

export async function getChannelEngagementStats() {
  const query = `
    WITH message_stats AS (
      SELECT 
        channel_id,
        COUNT(*) as total_messages,
        COUNT(DISTINCT author_id) as unique_authors,
        COUNT(DISTINCT thread_id) as threads_created,
        AVG(reaction_count) as avg_reactions_per_message,
        AVG(reply_count) as avg_replies_per_message,
        COUNTIF(reaction_count > 0) as messages_with_reactions,
        COUNTIF(reply_count > 0) as messages_with_replies
      FROM discord_berachain.messages
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY channel_id
    ),
    thread_stats AS (
      SELECT 
        channel_id,
        AVG(participants) as avg_participants_per_thread,
        AVG(messages) as avg_messages_per_thread
      FROM (
        SELECT 
          channel_id,
          thread_id,
          COUNT(DISTINCT author_id) as participants,
          COUNT(*) as messages
        FROM discord_berachain.messages
        WHERE thread_id IS NOT NULL
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        GROUP BY channel_id, thread_id
      )
      GROUP BY channel_id
    ),
    engagement_stats AS (
      SELECT 
        cm.channel_name,
        ms.*,
        ts.avg_participants_per_thread,
        ts.avg_messages_per_thread,
        (
          SAFE_DIVIDE(ms.avg_reactions_per_message, MAX(ms.avg_reactions_per_message) OVER()) * 0.3 +
          SAFE_DIVIDE(ms.avg_replies_per_message, MAX(ms.avg_replies_per_message) OVER()) * 0.3 +
          SAFE_DIVIDE(ms.unique_authors, MAX(ms.unique_authors) OVER()) * 0.2 +
          COALESCE(SAFE_DIVIDE(ts.avg_participants_per_thread, MAX(ts.avg_participants_per_thread) OVER()), 0) * 0.2
        ) * 100 as composite_score
      FROM message_stats ms
      JOIN discord_berachain.channel_metadata cm ON ms.channel_id = cm.channel_id
      LEFT JOIN thread_stats ts ON ms.channel_id = ts.channel_id
      WHERE ms.total_messages > 0
    )
    SELECT 
      channel_name,
      total_messages,
      unique_authors,
      avg_reactions_per_message,
      avg_replies_per_message,
      messages_with_reactions,
      messages_with_replies,
      threads_created,
      avg_participants_per_thread,
      avg_messages_per_thread,
      ROUND(composite_score, 1) as engagement_score
    FROM engagement_stats
    ORDER BY engagement_score DESC
  `;

  const [rows] = await bigquery.query({ query });
  return rows.map(row => ({
    channelName: row.channel_name,
    totalMessages: Number(row.total_messages),
    uniqueAuthors: Number(row.unique_authors),
    avgReactionsPerMessage: Number(row.avg_reactions_per_message),
    avgRepliesPerMessage: Number(row.avg_replies_per_message),
    messagesWithReactions: Number(row.messages_with_reactions),
    messagesWithReplies: Number(row.messages_with_replies),
    threadsCreated: Number(row.threads_created),
    avgParticipantsPerThread: Number(row.avg_participants_per_thread),
    avgMessagesPerThread: Number(row.avg_messages_per_thread),
    engagementScore: Number(row.engagement_score)
  }));
} 