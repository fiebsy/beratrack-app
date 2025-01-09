# Discord Messages with Channels View

## Overview

The `pickaxe-dashboard.discord_berachain.messages_with_channels` view enriches the base messages table by adding channel names to message data. This view joins the main messages table with the `channel_metadata` table to provide human-readable channel names alongside message data, making it easier to analyze channel-specific patterns and trends.

## View Information

- **Dataset**: `discord_berachain`
- **View Name**: `messages_with_channels`
- **Base Table**: `messages`
- **Type**: View (not materialized)
- **Updates**: Real-time (reflects base table)

## Schema

```sql
-- Inherited from messages table
message_id: STRING        -- Discord's unique message identifier
channel_id: STRING        -- Channel where message was sent
author_id: STRING        -- Discord user ID of message author
author_name: STRING      -- Author's username at time of message
author_avatar_url: STRING -- Author's avatar URL
author_roles: RECORD[]   -- Array of role objects {id: STRING, name: STRING}
content: STRING         -- Message text content
timestamp: TIMESTAMP    -- When message was sent (UTC)
reaction_count: INT64   -- Total reactions on message
reply_count: INT64     -- Total replies to message
unique_reactors: INT64  -- Distinct users who reacted
unique_repliers: INT64  -- Distinct users who replied
thread_id: STRING      -- Parent thread ID if applicable
is_thread_starter: BOOL -- Whether message started a thread
processed_at: TIMESTAMP -- When our system processed the message

-- Added by view
channel_name: STRING    -- Human-readable channel name
```

## Usage Examples

### Basic Channel Analysis
```sql
-- Get message counts by channel name
SELECT 
  channel_name,
  COUNT(*) as message_count,
  COUNT(DISTINCT author_id) as unique_authors
FROM `pickaxe-dashboard.discord_berachain.messages_with_channels`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY channel_name
ORDER BY message_count DESC;

-- Get active channels with thread discussions
SELECT 
  channel_name,
  COUNT(*) as total_messages,
  COUNTIF(is_thread_starter) as thread_starters,
  COUNTIF(thread_id IS NOT NULL) as thread_messages
FROM `pickaxe-dashboard.discord_berachain.messages_with_channels`
GROUP BY channel_name
HAVING thread_starters > 0
ORDER BY thread_messages DESC;
```

### CLI Examples
```bash
# View top channels by activity
bq query --use_legacy_sql=false '
SELECT 
  channel_name,
  COUNT(*) as messages,
  COUNT(DISTINCT author_id) as authors
FROM `pickaxe-dashboard.discord_berachain.messages_with_channels`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY channel_name
ORDER BY messages DESC
LIMIT 10'

# Get channel engagement metrics
bq query --use_legacy_sql=false '
SELECT 
  channel_name,
  AVG(reaction_count) as avg_reactions,
  AVG(reply_count) as avg_replies
FROM `pickaxe-dashboard.discord_berachain.messages_with_channels`
GROUP BY channel_name
HAVING avg_reactions > 0
ORDER BY avg_reactions DESC'
```

## Performance Considerations

1. **View Characteristics**
   - Non-materialized view (computed on query)
   - Inherits base table's partitioning and clustering
   - Additional join overhead with channel_metadata table
   - Channel names resolved through channel_metadata lookup

2. **Query Optimization**
   - Include timestamp filters when possible
   - Use channel_name for readability in results
   - Use channel_id for joins or complex filtering
   - Consider channel_metadata.last_updated for temporal accuracy

3. **Best Practices**
   - Use this view for analysis requiring channel names
   - Use base messages table if channel names aren't needed
   - Consider result set size when grouping by channel_name

## Common Use Cases

1. **Channel Activity Analysis**
   - Track message volume by channel
   - Monitor channel-specific engagement
   - Analyze cross-channel patterns

2. **Localization Insights**
   - Track activity in language-specific channels
   - Compare engagement across regions
   - Monitor international community growth

3. **Community Management**
   - Identify most/least active channels
   - Track channel-specific engagement metrics
   - Monitor thread usage by channel

## Related Views/Tables

- `messages` - Base table containing raw message data
- `channel_metadata` - Source table for channel name resolution
- `messages_with_attachments` - For attachment analysis with channel context
- Discord role tables for role-based channel analysis
