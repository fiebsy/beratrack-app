# Discord Messages Historical Backfill Table

## Table Statistics

### Coverage and Volume
- **Date Range**: June 1, 2024 - December 20, 2024 (≈6.5 months)
- **Total Messages**: 2,642,227
- **Unique Authors**: 49,437
- **Unique Channels**: 42

### Monthly Distribution
- June 2024: 215,250 messages
- July 2024: 311,572 messages
- August 2024: 615,526 messages (peak month)
- September 2024: 573,142 messages
- October 2024: 418,411 messages
- November 2024: 259,048 messages
- December 2024: 249,278 messages (partial month)

### Engagement Metrics
- **Thread Messages**: 1,127,964 (42.7% of total)
- **Messages with Reactions**: 178,498 (6.8% of total)
- **Average Reactions per Message**: 0.14

### Top Channels by Message Volume
1. Channel ID: 1193060684754341899 (462,575 messages)
2. Channel ID: 1010216277329055755 (311,426 messages)
3. Channel ID: 1012445032734785566 (295,340 messages)
4. Channel ID: 1010216197226233886 (282,785 messages)
5. Channel ID: 1195105278870442145 (258,234 messages)

### Key Insights
- High thread usage (42.7%) indicates active discussions
- Moderate reaction engagement (6.8% of messages)
- Top 5 channels account for 61% of all messages
- Peak activity in August 2024 (615K messages)
- Activity pattern shows growth until August, then gradual decline
- Average of 13,547 messages per day
- Approximately 253 unique authors per channel

## Overview

The `pickaxe-dashboard.discord_berachain.messages_historical_backfill` table contains historical Discord message data imported during the initial data collection phase. This table complements the main messages table by providing historical context and baseline data for long-term trend analysis.

## Table Information

- **Dataset**: `discord_berachain`
- **Table**: `messages_historical_backfill`
- **Update Frequency**: Static (historical data only)
- **Partitioning**: Daily on `timestamp`
- **Clustering**: `channel_id`, `author_id`, `message_id`

## Schema

```sql
message_id: STRING       -- Discord's unique message identifier (required)
channel_id: STRING       -- Channel where message was sent (required)
author_id: STRING       -- Discord user ID of message author (required)
author_name: STRING     -- Author's username at time of message (required)
author_avatar_url: STRING -- Author's avatar URL at time of message
author_roles: RECORD[]  -- Array of role objects {id: STRING, name: STRING}
content: STRING        -- Message text content (required)
timestamp: TIMESTAMP   -- When message was sent (UTC) (required)
reaction_count: INT64  -- Total reactions on message
reply_count: INT64    -- Total replies to message
thread_id: STRING     -- Parent thread ID if applicable
processed_at: TIMESTAMP -- When our system processed the message (required)
```

## Key Differences from Main Messages Table

1. **Schema Differences**
   - No `attachment_urls` field
   - No `unique_reactors` or `unique_repliers` fields
   - No `is_thread_starter` field
   - More required fields (marked as NOT NULL)

2. **Data Characteristics**
   - Contains only historical data
   - Static dataset (no ongoing updates)
   - Used primarily for trend analysis and baseline metrics

## Query Optimization

### Best Practices

1. **Time-Based Queries**
   ```sql
   -- Good: Uses partitioning
   WHERE timestamp BETWEEN '2023-01-01' AND '2023-12-31'
   
   -- Avoid: Full table scan
   WHERE EXTRACT(MONTH FROM timestamp) = 1
   ```

2. **Efficient Filtering**
   ```sql
   -- Good: Uses clustering
   WHERE channel_id = 'target_channel'
   AND author_id = 'target_author'
   AND message_id = 'target_message'
   
   -- Avoid: Non-clustered field first
   WHERE reaction_count > 0
   ```

### Common Analysis Patterns

```sql
-- Historical message volume trends
SELECT 
  DATE_TRUNC(timestamp, MONTH) as month,
  COUNT(*) as message_count,
  COUNT(DISTINCT author_id) as unique_authors
FROM `pickaxe-dashboard.discord_berachain.messages_historical_backfill`
GROUP BY month
ORDER BY month;

-- Channel growth analysis
SELECT
  channel_id,
  DATE_TRUNC(timestamp, WEEK) as week,
  COUNT(*) as messages,
  COUNT(DISTINCT author_id) as active_users
FROM `pickaxe-dashboard.discord_berachain.messages_historical_backfill`
GROUP BY channel_id, week
ORDER BY week, channel_id;
```

## CLI Query Examples

### Basic Queries
```bash
# Get earliest and latest messages
bq query --use_legacy_sql=false '
SELECT 
  MIN(timestamp) as earliest_message,
  MAX(timestamp) as latest_message
FROM `pickaxe-dashboard.discord_berachain.messages_historical_backfill`'

# Sample messages from specific period
bq query --use_legacy_sql=false '
SELECT timestamp, author_name, content
FROM `pickaxe-dashboard.discord_berachain.messages_historical_backfill`
WHERE timestamp BETWEEN "2023-06-01" AND "2023-06-02"
LIMIT 5'
```

### Historical Analysis
```bash
# Monthly activity patterns
bq query --use_legacy_sql=false '
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour_of_day,
  COUNT(*) as message_count
FROM `pickaxe-dashboard.discord_berachain.messages_historical_backfill`
GROUP BY hour_of_day
ORDER BY hour_of_day'
```

## Data Consistency Notes

- Data is static and represents historical state
- Message content and metadata reflect values at collection time
- Role information represents roles at message creation time
- Reaction and reply counts may not reflect current values
- Thread relationships are preserved as they were at collection time

## Related Tables

- `messages` - Current and ongoing message data
- `messages_with_attachments` - Current message attachment data
- Discord role tables for historical role context

## Usage Guidelines

1. **Historical Analysis**
   - Use for establishing baseline metrics
   - Analyze long-term trends
   - Study community growth patterns

2. **Data Integration**
   - Join with main messages table for complete timeline
   - Consider schema differences when combining data
   - Account for potential duplicates if periods overlap

3. **Performance Considerations**
   - Leverage partitioning for time-based queries
   - Use all clustering fields when possible
   - Consider data volume in analysis timeframes
