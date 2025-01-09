# Discord Messages with Media View

## Overview

The `pickaxe-dashboard.discord_berachain.messages_with_media` view combines message data with preserved media information from the attachments table. It provides a comprehensive view of messages that include media attachments, enriching message content with both Discord and preserved GCS URLs.

## View Information

- **Dataset**: `discord_berachain`
- **View Name**: `messages_with_media`
- **Base Tables**: 
  - `messages` (primary message data)
  - `messages_with_attachments` (media preservation data)
- **Type**: View (not materialized)
- **Updates**: Real-time (reflects base tables)

## Schema

```sql
-- Inherited from messages table
message_id: STRING        -- Discord's unique message identifier
channel_id: STRING       -- Channel where message was sent
author_id: STRING       -- Discord user ID of message author
author_name: STRING     -- Author's username at time of message
author_avatar_url: STRING -- Author's avatar URL
author_roles: RECORD[]  -- Array of role objects {id: STRING, name: STRING}
content: STRING        -- Message text content
timestamp: TIMESTAMP   -- When message was sent (UTC)
reaction_count: INT64  -- Total reactions on message
reply_count: INT64    -- Total replies to message
unique_reactors: INT64 -- Distinct users who reacted
unique_repliers: INT64 -- Distinct users who replied
thread_id: STRING     -- Parent thread ID if applicable
is_thread_starter: BOOL -- Whether message started a thread
processed_at: TIMESTAMP -- When our system processed the message
attachment_urls: STRING[] -- Original Discord attachment URLs

-- Added by view
media_urls: RECORD[] {   -- Array of media information
  discord_url: STRING,   -- Original Discord CDN URL
  gcs_url: STRING,      -- Preserved GCS URL
  filename: STRING      -- Original filename
}
```

## Usage Examples

### Basic Media Analysis
```sql
-- Get messages with preserved media
SELECT 
  message_id,
  author_name,
  timestamp,
  m.filename,
  m.gcs_url
FROM `pickaxe-dashboard.discord_berachain.messages_with_media`,
UNNEST(media_urls) as m
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY timestamp DESC;

-- Get media post frequency by author
SELECT 
  author_name,
  COUNT(DISTINCT message_id) as messages_with_media,
  COUNT(m) as total_media_items
FROM `pickaxe-dashboard.discord_berachain.messages_with_media`,
UNNEST(media_urls) as m
GROUP BY author_name
HAVING messages_with_media > 1
ORDER BY messages_with_media DESC;
```

### CLI Examples
```bash
# Get recent media posts
bq query --use_legacy_sql=false '
SELECT 
  timestamp,
  author_name,
  ARRAY_LENGTH(media_urls) as media_count
FROM `pickaxe-dashboard.discord_berachain.messages_with_media`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY timestamp DESC'

# Analyze media types
bq query --use_legacy_sql=false '
SELECT 
  REGEXP_EXTRACT(m.filename, r"\.([^\.]+)$") as extension,
  COUNT(*) as count
FROM `pickaxe-dashboard.discord_berachain.messages_with_media`,
UNNEST(media_urls) as m
GROUP BY extension
ORDER BY count DESC'
```

## Performance Considerations

1. **View Characteristics**
   - Non-materialized view (computed on query)
   - Joins messages with attachment data
   - Preserves message partitioning/clustering
   - Array field for multiple media items

2. **Query Optimization**
   - Use UNNEST for media_urls array when needed
   - Include timestamp filters when possible
   - Consider array operations cost
   - Leverage message table's optimizations

3. **Best Practices**
   - Filter by timestamp before accessing media_urls
   - Use appropriate array functions
   - Consider result set size with media data

## Common Use Cases

1. **Media Analysis**
   - Track media sharing patterns
   - Analyze file types and sizes
   - Monitor preservation status

2. **User Behavior**
   - Identify media-heavy users
   - Track media engagement
   - Analyze posting patterns

3. **Content Management**
   - Monitor media preservation
   - Track media availability
   - Analyze media distribution

## Related Views/Tables

- `messages` - Base message data
- `messages_with_attachments` - Source of media preservation data
- Channel metadata for context

## Notes

- Media URLs array may be empty for non-media messages
- GCS URLs are available only for successfully preserved media
- Original Discord URLs may expire
- Filename information helps identify media types
