# Discord Channel Metadata Table

## Overview

The `pickaxe-dashboard.discord_berachain.channel_metadata` table serves as the source of truth for Discord channel information. It maintains a mapping between channel IDs and their human-readable names, enabling channel name resolution across the analytics platform.

## Table Information

- **Dataset**: `discord_berachain`
- **Table**: `channel_metadata`
- **Update Frequency**: Daily
- **Row Count**: 42 channels
- **Size**: ~2KB

## Schema

```sql
channel_id: STRING      -- Discord's unique channel identifier
channel_name: STRING    -- Human-readable channel name
last_updated: TIMESTAMP -- When the channel metadata was last updated
```

## Key Characteristics

1. **Data Properties**
   - One row per Discord channel
   - Channel names are current as of last_updated timestamp
   - Compact, reference table design

2. **Update Pattern**
   - Daily refresh to capture channel name changes
   - Maintains historical channel mappings
   - Timestamp tracking for data freshness

## Usage Examples

### Basic Queries
```sql
-- Get all active channels
SELECT channel_id, channel_name
FROM `pickaxe-dashboard.discord_berachain.channel_metadata`
ORDER BY channel_name;

-- Find recently updated channels
SELECT channel_id, channel_name, last_updated
FROM `pickaxe-dashboard.discord_berachain.channel_metadata`
WHERE last_updated >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY last_updated DESC;
```

### CLI Examples
```bash
# List all channels
bq query --use_legacy_sql=false '
SELECT channel_name, last_updated
FROM `pickaxe-dashboard.discord_berachain.channel_metadata`
ORDER BY channel_name'

# Check for specific channel
bq query --use_legacy_sql=false '
SELECT *
FROM `pickaxe-dashboard.discord_berachain.channel_metadata`
WHERE channel_name = "general"'
```

## Common Use Cases

1. **Channel Resolution**
   - Map channel IDs to readable names
   - Track channel name changes
   - Verify channel existence

2. **Data Validation**
   - Verify message channel references
   - Validate channel consistency
   - Track metadata freshness

3. **Channel Management**
   - Monitor channel additions/changes
   - Track international channels
   - Audit channel naming

## Related Views/Tables

- `messages_with_channels` - Uses this table to resolve channel names
- `messages` - References channel_id that maps to this table
- Other analytics views that need channel name resolution

## Best Practices

1. **Querying**
   - Use for channel name lookups
   - Join on channel_id for name resolution
   - Check last_updated for data freshness

2. **Performance**
   - Small table, efficient for joins
   - No partitioning needed
   - Frequently cached due to size

3. **Data Integration**
   - Use as reference table in views
   - Join early in query plans
   - Consider last_updated in temporal analysis 