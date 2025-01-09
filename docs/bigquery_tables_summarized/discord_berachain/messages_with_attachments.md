# Discord Messages with Attachments Table

## Overview

The `pickaxe-dashboard.discord_berachain.messages_with_attachments` table stores and tracks Discord message attachments, managing the preservation of media files from Discord to Google Cloud Storage (GCS). This table serves as the source for media tracking and preservation status across the platform.

## Table Information

- **Dataset**: `discord_berachain`
- **Table**: `messages_with_attachments`
- **Update Frequency**: Real-time with message processing
- **Row Count**: ~13.7K attachments
- **Size**: ~5.9MB

## Schema

```sql
message_id: STRING            -- Discord's unique message identifier
channel_id: STRING           -- Channel where message was sent
discord_url: STRING         -- Original Discord CDN URL
filename: STRING           -- Original filename of attachment
message_timestamp: TIMESTAMP -- When the message was sent
processed_at: TIMESTAMP    -- When our system processed the attachment
preservation_status: STRING -- Current status of preservation (e.g., 'COMPLETED', 'PENDING', 'ERROR')
gcs_url: STRING           -- Google Cloud Storage URL where file is preserved
preservation_attempted_at: TIMESTAMP -- When preservation was first attempted
preservation_completed_at: TIMESTAMP -- When preservation was completed
error: STRING             -- Error message if preservation failed
```

## Key Characteristics

1. **Data Properties**
   - One row per message attachment
   - Tracks both Discord and GCS URLs
   - Maintains preservation history
   - Records processing status and errors

2. **Preservation Flow**
   - Captures attachment on message creation
   - Attempts preservation to GCS
   - Tracks preservation status
   - Records completion or failure

## Usage Examples

### Basic Queries
```sql
-- Get preservation status distribution
SELECT 
  preservation_status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM `pickaxe-dashboard.discord_berachain.messages_with_attachments`
GROUP BY preservation_status
ORDER BY count DESC;

-- Find recent attachments
SELECT 
  message_id,
  filename,
  discord_url,
  gcs_url,
  preservation_status
FROM `pickaxe-dashboard.discord_berachain.messages_with_attachments`
WHERE message_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY message_timestamp DESC;
```

### CLI Examples
```bash
# Check preservation success rate
bq query --use_legacy_sql=false '
SELECT 
  DATE(preservation_attempted_at) as date,
  COUNT(*) as attempts,
  COUNTIF(preservation_status = "COMPLETED") as successes,
  ROUND(COUNTIF(preservation_status = "COMPLETED") * 100.0 / COUNT(*), 2) as success_rate
FROM `pickaxe-dashboard.discord_berachain.messages_with_attachments`
GROUP BY date
ORDER BY date DESC
LIMIT 7'

# Find failed preservations
bq query --use_legacy_sql=false '
SELECT 
  message_id,
  filename,
  error,
  preservation_attempted_at
FROM `pickaxe-dashboard.discord_berachain.messages_with_attachments`
WHERE preservation_status = "ERROR"
ORDER BY preservation_attempted_at DESC'
```

## Common Use Cases

1. **Media Tracking**
   - Monitor attachment preservation
   - Track media types and volumes
   - Analyze preservation success rates

2. **Error Analysis**
   - Identify failed preservations
   - Monitor error patterns
   - Track preservation latency

3. **Storage Management**
   - Track GCS usage
   - Monitor file types
   - Analyze preservation patterns

## Related Views/Tables

- `messages_with_media` - View combining message data with preserved media information
- `messages` - Parent message information
- Channel metadata for context

## Best Practices

1. **Querying**
   - Filter by message_timestamp for time-based analysis
   - Check preservation_status for completeness
   - Use gcs_url for preserved media access

2. **Performance**
   - Small table, efficient for full scans
   - Join with messages table on message_id
   - Consider status checks in WHERE clause

3. **Data Integration**
   - Use for media availability verification
   - Track preservation completion
   - Monitor error patterns

## Notes

- Preservation attempts may be retried
- GCS URLs are permanent once preservation is complete
- Error field provides debugging context
- Timestamps track full preservation lifecycle
