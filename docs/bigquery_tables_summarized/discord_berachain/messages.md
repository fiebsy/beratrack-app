# Discord Messages Table

## Table Statistics

### Coverage and Volume
- **Date Range**: June 1, 2024 16:16:43 UTC - Present
- **Total Messages**: 401,503 (as of Jan 8, 2025)
- **Update Frequency**: Near real-time

### Historical Coverage Note
For analysis requiring data from before June 1, 2024 16:16:43 UTC, use the `messages_historical_backfill` table. When performing analysis across the entire time range:
1. Use `messages_historical_backfill` for historical trends
2. Use this table for current data and real-time analysis
3. When joining tables, be mindful of potential overlap around June 1, 2024

## Overview

The `pickaxe-dashboard.discord_berachain.messages` table serves as the primary source of Discord message data in the BeraTrack system. It captures all message events and their associated metadata, enabling comprehensive analysis of community interactions and engagement patterns.

## Table Information

- **Dataset**: `discord_berachain`
- **Table**: `messages`
- **Update Frequency**: Near real-time
- **Partitioning**: Daily on `timestamp`
- **Clustering**: `channel_id`, `author_id`

## Schema

```sql
message_id: STRING       -- Discord's unique message identifier
channel_id: STRING       -- Channel where message was sent
author_id: STRING       -- Discord user ID of message author
author_name: STRING     -- Author's username at time of message
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
attachment_urls: STRING[] -- Array of media/file URLs
```

## Core Use Cases

1. **Engagement Analysis**
   - Message volume trends
   - User participation patterns
   - Channel activity distribution
   - Reaction and reply engagement

2. **Thread Analysis**
   - Thread creation patterns
   - Discussion depth tracking
   - Topic engagement metrics

3. **Role-Based Analysis**
   - Role participation tracking
   - Community segment activity
   - Role interaction patterns

## Query Optimization

### Best Practices

1. **Time-Based Queries**
   ```sql
   -- Good: Uses partitioning
   WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
   
   -- Avoid: Full table scan
   WHERE EXTRACT(YEAR FROM timestamp) = 2024
   ```

2. **User/Channel Analysis**
   ```sql
   -- Good: Uses clustering
   WHERE channel_id = 'target_channel'
   AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
   
   -- Avoid: Non-clustered field first
   WHERE reaction_count > 0
   AND channel_id = 'target_channel'
   ```

3. **Role Analysis**
   ```sql
   -- Efficient role filtering
   WHERE EXISTS (
     SELECT 1 
     FROM UNNEST(author_roles) role 
     WHERE role.id = 'target_role'
   )
   ```

### Common Aggregations

```sql
-- Message volume by channel
SELECT 
  channel_id,
  COUNT(*) as message_count,
  COUNT(DISTINCT author_id) as unique_authors
FROM `pickaxe-dashboard.discord_berachain.messages`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY channel_id

-- Engagement metrics
SELECT
  DATE(timestamp) as date,
  COUNT(*) as messages,
  SUM(reaction_count) as total_reactions,
  AVG(CAST(unique_reactors AS FLOAT64)) as avg_unique_reactors
FROM `pickaxe-dashboard.discord_berachain.messages`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date
```

## Data Consistency

- Messages are processed in near real-time
- Reaction and reply counts are updated periodically
- Author roles reflect the user's roles at message creation time
- Deleted messages remain in the table for historical analysis
- Thread relationships are maintained even if parent/child is deleted

## Related Tables

- `messages_with_attachments` - Detailed attachment analysis
- `messages_with_media` - Media-specific message analysis
- Discord role tables for role-based analysis

## Notes

- The table maintains message history indefinitely
- Author information reflects state at message creation
- Reaction/reply metrics may have slight delays in updates
- Thread relationships are preserved for deleted content
- URLs and external references are stored as provided by Discord

## CLI Query Examples

### Basic Query Format
```bash
# Basic syntax
bq query --use_legacy_sql=false 'YOUR_QUERY_HERE'

# With project specified
bq query --project_id=pickaxe-dashboard --use_legacy_sql=false 'YOUR_QUERY_HERE'
```

### Common CLI Patterns

1. **Table Inspection**
```bash
# View table schema
bq show pickaxe-dashboard:discord_berachain.messages

# Sample recent messages
bq query --use_legacy_sql=false '
SELECT timestamp, author_name, content
FROM `pickaxe-dashboard.discord_berachain.messages`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
LIMIT 5'

# Get table metadata
bq show --format=prettyjson pickaxe-dashboard:discord_berachain.messages
```

2. **Data Export**
```bash
# Export to CSV (replace YOUR_BUCKET with actual GCS bucket)
bq extract --destination_format CSV \
  'pickaxe-dashboard:discord_berachain.messages' \
  'gs://YOUR_BUCKET/exports/messages_*.csv'

# Export query results
bq query --use_legacy_sql=false --format=csv '
SELECT DATE(timestamp) as date, COUNT(*) as message_count
FROM `pickaxe-dashboard.discord_berachain.messages`
GROUP BY date
ORDER BY date DESC
LIMIT 10' > message_counts.csv
```

3. **Performance Analysis**
```bash
# Dry run to estimate query cost
bq query --dry_run --use_legacy_sql=false '
SELECT COUNT(DISTINCT author_id)
FROM `pickaxe-dashboard.discord_berachain.messages`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)'

# Get processed bytes for a query
bq query --format=prettyjson --use_legacy_sql=false '
SELECT COUNT(*) as message_count
FROM `pickaxe-dashboard.discord_berachain.messages`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)'
```

### Tips for CLI Usage

1. **Query Organization**
   - Use line breaks and proper indentation for readability
   - Wrap queries in single quotes
   - Use heredoc for multi-line queries:
   ```bash
   bq query --use_legacy_sql=false '
   SELECT
     DATE(timestamp) as date,
     COUNT(*) as messages,
     COUNT(DISTINCT author_id) as unique_authors
   FROM `pickaxe-dashboard.discord_berachain.messages`
   WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
   GROUP BY date
   ORDER BY date DESC'
   ```

2. **Output Formatting**
   ```bash
   # Pretty JSON output
   bq query --format=prettyjson ...

   # CSV output
   bq query --format=csv ...

   # Minimal output
   bq query --quiet --format=sparse ...
   ```

3. **Job Management**
   ```bash
   # List recent jobs
   bq ls -j -a

   # Get specific job details
   bq show -j JOB_ID
   ```
