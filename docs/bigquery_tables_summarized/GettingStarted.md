# Getting Started with BeraTrack BigQuery

## Overview

BeraTrack's BigQuery infrastructure is organized into two primary datasets that power Discord community analytics:
- `discord_berachain`: Core message and channel data
- `discord_berachain_roles`: Role-based analytics and engagement metrics

## Data Architecture

### Message Analytics (`discord_berachain`)

1. **Core Message Data**
   - `messages`: Primary message table (June 2024 - Present)
     - Real-time message tracking
     - Engagement metrics (reactions, replies)
     - Thread analytics
   
   - `messages_historical_backfill`: Historical message archive
     - Historical data preservation
     - Baseline metrics
     - Legacy data analysis

2. **Channel Information**
   - `channel_metadata`: Channel reference data
     - Channel name mappings
     - Channel metadata
   
   - `messages_with_channels`: Enhanced message view
     - Human-readable channel names
     - Channel-based analytics

3. **Media Tracking**
   - `messages_with_attachments`: Media preservation
     - Discord CDN to GCS migration
     - Attachment tracking
     - Preservation status
   
   - `messages_with_media`: Media analysis view
     - Enhanced media metadata
     - Attachment analytics

### Role Analytics (`discord_berachain_roles`)

1. **Role Management**
   - `discord_roles_current`: Active role state
     - Current role assignments
     - User quality scores
     - Real-time role tracking
   
   - `discord_roles_view`: Role assignment view
     - Simplified role data
     - Role membership tracking

2. **Role Analytics**
   - `discord_roles_glossary`: Role analytics hub
     - Role definitions and metadata
     - Engagement metrics
     - Community health indicators

## Update Mechanisms

### Firebase Functions (as of Jan 8, 2025)

1. **Role Updates**
   - 30-minute intervals
   - Updates current role assignments
   - Maintains user search indices

2. **Quality Metrics**
   - 2-hour intervals
   - Updates user quality scores
   - Calculates role-level metrics

3. **Activity Stats**
   - 2-hour intervals
   - Updates engagement metrics
   - Tracks community health

## Common Analysis Patterns

### 1. Message Analysis
```sql
-- Recent activity by channel
SELECT 
  c.channel_name,
  COUNT(*) as messages,
  COUNT(DISTINCT m.author_id) as unique_authors
FROM `pickaxe-dashboard.discord_berachain.messages` m
JOIN `pickaxe-dashboard.discord_berachain.channel_metadata` c
  ON m.channel_id = c.channel_id
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY channel_name
ORDER BY messages DESC;
```

### 2. Role Performance
```sql
-- Top performing community roles
SELECT 
  role_name,
  active_users,
  active_percentage,
  avg_quality_score
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary`
WHERE badge = 'COMMUNITY'
  AND active_users >= 5
ORDER BY avg_quality_score DESC
LIMIT 5;
```

### 3. User Engagement
```sql
-- Most engaged users
SELECT 
  author_name,
  quality_score,
  ARRAY_LENGTH(author_roles) as role_count
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_current`
WHERE quality_score > 0
ORDER BY quality_score DESC
LIMIT 10;
```

## Best Practices

1. **Performance Optimization**
   - Use table partitioning (timestamp-based)
   - Leverage clustering keys
   - Filter early in queries
   - Consider data volumes

2. **Data Integration**
   - Join on consistent keys (channel_id, author_id)
   - Consider update frequencies
   - Use appropriate views for common patterns

3. **Analysis Guidelines**
   - Start with recent data (last 30 days)
   - Filter out system/bot roles
   - Consider activity thresholds
   - Use appropriate aggregation levels

## Table Selection Guide

1. **For Message Analysis**
   - Current messages → `messages`
   - Historical analysis → `messages_historical_backfill`
   - Channel context → `messages_with_channels`
   - Media tracking → `messages_with_media`

2. **For Role Analysis**
   - Current state → `discord_roles_current`
   - Role metrics → `discord_roles_glossary`
   - Basic role data → `discord_roles_view`

3. **For Channel Analysis**
   - Channel mapping → `channel_metadata`
   - Channel activity → `messages_with_channels`

## Next Steps

1. Review specific table documentation for detailed schemas and examples
2. Understand update mechanisms for time-sensitive analysis
3. Consider data freshness requirements for your use case
4. Use appropriate views for common analysis patterns

Each table is documented in detail in its own markdown file within this directory.
