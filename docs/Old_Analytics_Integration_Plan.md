# Discord Analytics Integration Plan

## Overview
This document outlines the plan for creating and maintaining analytics tables that track engagement and content from the Berachain Discord community. The goal is to surface meaningful discussions, track community health, and highlight team interactions while ensuring smaller communities and channels are properly represented.

## Current Status
- Test tables have been created as reference implementations:
  - `test_daily_channel_analytics`
  - `test_engaged_threads`
These test tables serve as examples and will be replaced with production tables following this plan.

## Data Sources
- Primary Messages Table: `discord_berachain.messages`
- Attachments Table: `discord_berachain.messages_with_attachments`
- Channel Metadata: `discord_berachain.channel_metadata`

## Analytics Tables Structure

### 1. Engaged Threads (`engaged_threads`)
Tracks meaningful discussions across all channels with a focus on inclusivity.

#### Inclusion Criteria
Based on our analysis of thread engagement patterns:
- Minimum thread size: 2 messages (to capture quick but meaningful exchanges)
- Minimum engagement (any of):
  - Total reactions ≥ 2 (25th percentile is 0)
  - Total replies ≥ 2 (25th percentile is 0)
  - Contains team member participation
  - Contains preserved attachment

#### Schema
```sql
CREATE TABLE discord_berachain_analytics.engaged_threads (
  thread_id STRING,
  starter_message_id STRING,
  starter_content STRING,
  starter_author_id STRING,
  starter_author_name STRING,
  starter_author_avatar_url STRING,
  thread_start_time TIMESTAMP,
  channel_id STRING,
  channel_name STRING,
  message_count INT64,
  unique_participants INT64,
  total_reactions INT64,
  total_replies INT64,
  has_team_participation BOOL,
  messages ARRAY<STRUCT<
    message_id STRING,
    content STRING,
    author_id STRING,
    author_name STRING,
    author_avatar_url STRING,
    timestamp TIMESTAMP,
    reaction_count INT64,
    reply_count INT64,
    preserved_attachment_url STRING,
    has_unpreserved_attachment BOOL
  >>
)
```

### 2. Daily Channel Analytics (`daily_channel_analytics`)
Tracks comprehensive daily activity and engagement metrics per channel.

#### Metrics Categories

1. **Basic Activity**
   - Total messages
   - Unique authors
   - New vs returning authors
   - Messages per author ratios

2. **Thread Activity**
   - New threads created
   - Messages in threads
   - Team participation in threads
   - Thread engagement rates

3. **Engagement Quality**
   - Reaction patterns
   - Reply patterns
   - Team interaction rates
   - Content preservation success

4. **Community Health**
   - Author retention
   - Team responsiveness
   - Peak activity patterns
   - Cross-channel participation

#### Schema
```sql
CREATE TABLE discord_berachain_analytics.daily_channel_analytics (
    date DATE,
    channel_id STRING,
    channel_name STRING,
    
    -- Basic Activity Metrics
    total_messages INT64,
    unique_authors INT64,
    new_authors INT64,  -- First-time posters in the channel
    returning_authors INT64,  -- Authors who posted before
    
    -- Thread Metrics
    threads_created INT64,
    messages_in_threads INT64,
    threads_with_team INT64,  -- Threads with team participation
    
    -- Engagement Metrics
    total_reactions INT64,
    total_replies INT64,
    messages_with_reactions INT64,  -- Messages that received at least one reaction
    messages_with_replies INT64,    -- Messages that received at least one reply
    
    -- Team Interaction Metrics
    team_messages INT64,
    team_reactions_given INT64,
    team_replies INT64,
    unique_team_members INT64,
    
    -- Media Metrics
    messages_with_attachments INT64,
    preserved_attachments INT64,
    unpreserved_attachments INT64,
    
    -- Time-based Metrics
    peak_hour INT64,  -- Hour with most activity (0-23)
    active_hours INT64,  -- Number of hours with activity
    
    -- Engagement Quality Metrics
    avg_thread_length FLOAT64,  -- Average messages per thread
    avg_thread_participants FLOAT64,  -- Average unique participants per thread
    avg_reactions_per_message FLOAT64,
    avg_replies_per_message FLOAT64,
    
    -- Community Health Metrics
    repeat_author_rate FLOAT64,  -- % of authors who posted multiple times
    team_engagement_rate FLOAT64,  -- % of messages that got team interaction
    preservation_success_rate FLOAT64,  -- % of attachments successfully preserved
    
    -- Top Content Summary
    top_threads ARRAY<STRUCT<
        thread_id STRING,
        starter_content STRING,
        message_count INT64,
        total_engagement INT64,
        has_team_participation BOOL
    >>,
    
    -- Hourly Activity Breakdown
    hourly_activity ARRAY<STRUCT<
        hour INT64,
        message_count INT64,
        unique_authors INT64
    >>
)
```

## Implementation Plan

### Phase 1: Initial Setup (Current)
- ✅ Create test tables for validation
- ⏳ Review and refine schemas
- ⏳ Validate data source connections

### Phase 2: Production Implementation
1. Create production tables:
   ```sql
   -- Create engaged_threads
   CREATE TABLE discord_berachain_analytics.engaged_threads (...)
   
   -- Create daily_channel_analytics
   CREATE TABLE discord_berachain_analytics.daily_channel_analytics (...)
   ```

2. Implement data population queries
3. Set up monitoring and validation

### Phase 3: Automation
1. Configure scheduled updates
2. Implement error handling
3. Set up alerts and monitoring

## Implementation Queries

### 1. Daily Analytics Population Query
This query populates the daily analytics table for a given date range. It can be run for historical data or as a daily update.

```sql
-- Step 1: Calculate base metrics
WITH base_metrics AS (
  SELECT
    DATE(m.timestamp) as date,
    m.channel_id,
    cm.channel_name,
    -- Basic Activity
    COUNT(DISTINCT m.message_id) as total_messages,
    COUNT(DISTINCT m.author_id) as unique_authors,
    COUNT(DISTINCT CASE WHEN NOT EXISTS (
      SELECT 1 FROM discord_berachain.messages m2 
      WHERE m2.author_id = m.author_id 
      AND DATE(m2.timestamp) < DATE(m.timestamp)
    ) THEN m.author_id END) as new_authors,
    COUNT(DISTINCT CASE WHEN EXISTS (
      SELECT 1 FROM discord_berachain.messages m2 
      WHERE m2.author_id = m.author_id 
      AND DATE(m2.timestamp) < DATE(m.timestamp)
    ) THEN m.author_id END) as returning_authors,
    
    -- Thread Activity
    COUNT(DISTINCT CASE WHEN m.thread_id IS NOT NULL THEN m.thread_id END) as threads_created,
    COUNT(DISTINCT CASE WHEN m.thread_id IS NOT NULL THEN m.message_id END) as messages_in_threads,
    COUNT(DISTINCT CASE WHEN m.thread_id IS NOT NULL AND EXISTS(
      SELECT 1 FROM UNNEST(m.author_roles) r WHERE r.name IN ("Team", "Mod", "Admin")
    ) THEN m.thread_id END) as threads_with_team,
    
    -- Engagement Metrics
    SUM(m.reaction_count) as total_reactions,
    SUM(m.reply_count) as total_replies,
    COUNT(DISTINCT CASE WHEN m.reaction_count > 0 THEN m.message_id END) as messages_with_reactions,
    COUNT(DISTINCT CASE WHEN m.reply_count > 0 THEN m.message_id END) as messages_with_replies,
    
    -- Team Metrics
    COUNT(DISTINCT CASE WHEN EXISTS(
      SELECT 1 FROM UNNEST(m.author_roles) r WHERE r.name IN ("Team", "Mod", "Admin")
    ) THEN m.message_id END) as team_messages,
    COUNT(DISTINCT CASE WHEN EXISTS(
      SELECT 1 FROM UNNEST(m.author_roles) r WHERE r.name IN ("Team", "Mod", "Admin")
    ) THEN m.author_id END) as unique_team_members,
    
    -- Media Metrics
    COUNT(DISTINCT CASE WHEN att.message_id IS NOT NULL THEN m.message_id END) as messages_with_attachments,
    COUNT(DISTINCT CASE WHEN att.preservation_status = "completed" THEN m.message_id END) as preserved_attachments,
    COUNT(DISTINCT CASE WHEN att.message_id IS NOT NULL AND att.preservation_status != "completed" 
      THEN m.message_id END) as unpreserved_attachments
  FROM discord_berachain.messages m
  LEFT JOIN discord_berachain.channel_metadata cm ON m.channel_id = cm.channel_id
  LEFT JOIN discord_berachain.messages_with_attachments att ON m.message_id = att.message_id
  WHERE DATE(m.timestamp) BETWEEN start_date AND end_date  -- Parameterized date range
  GROUP BY date, m.channel_id, cm.channel_name
),

-- Step 2: Calculate hourly activity
hourly_stats AS (
  SELECT
    DATE(timestamp) as date,
    channel_id,
    ARRAY_AGG(STRUCT(
      EXTRACT(HOUR FROM timestamp) as hour,
      COUNT(DISTINCT message_id) as message_count,
      COUNT(DISTINCT author_id) as unique_authors
    ) ORDER BY EXTRACT(HOUR FROM timestamp)) as hourly_activity,
    MAX(CASE WHEN rank = 1 THEN EXTRACT(HOUR FROM timestamp) END) as peak_hour,
    COUNT(DISTINCT EXTRACT(HOUR FROM timestamp)) as active_hours
  FROM (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY DATE(timestamp), channel_id 
        ORDER BY COUNT(*) DESC
      ) as rank
    FROM discord_berachain.messages
    WHERE DATE(timestamp) BETWEEN start_date AND end_date
    GROUP BY DATE(timestamp), channel_id, EXTRACT(HOUR FROM timestamp)
  )
  GROUP BY date, channel_id
),

-- Step 3: Get top threads
top_threads AS (
  SELECT
    DATE(thread_start_time) as date,
    channel_id,
    ARRAY_AGG(STRUCT(
      thread_id,
      starter_content,
      message_count,
      total_reactions + total_replies as total_engagement,
      has_team_participation
    ) ORDER BY total_reactions + total_replies DESC LIMIT 5) as top_threads
  FROM discord_berachain_analytics.engaged_threads
  WHERE DATE(thread_start_time) BETWEEN start_date AND end_date
  GROUP BY date, channel_id
)

-- Step 4: Combine all metrics
SELECT
  b.*,
  h.hourly_activity,
  h.peak_hour,
  h.active_hours,
  -- Calculate derived metrics
  ROUND(SAFE_DIVIDE(b.total_reactions, b.total_messages), 2) as avg_reactions_per_message,
  ROUND(SAFE_DIVIDE(b.total_replies, b.total_messages), 2) as avg_replies_per_message,
  ROUND(SAFE_DIVIDE(b.returning_authors, b.unique_authors), 2) as repeat_author_rate,
  ROUND(SAFE_DIVIDE(b.team_messages, b.total_messages), 2) as team_engagement_rate,
  ROUND(SAFE_DIVIDE(b.preserved_attachments, b.messages_with_attachments), 2) as preservation_success_rate,
  t.top_threads
FROM base_metrics b
LEFT JOIN hourly_stats h ON b.date = h.date AND b.channel_id = h.channel_id
LEFT JOIN top_threads t ON b.date = t.date AND b.channel_id = t.channel_id
```

### Historical Data Population
To populate historical data:

1. **Initial Load**:
```sql
DECLARE start_date DATE DEFAULT '2024-06-01';  -- Earliest data date
DECLARE end_date DATE DEFAULT CURRENT_DATE();

-- Run daily analytics population query with date range
EXECUTE IMMEDIATE '''
  INSERT INTO discord_berachain_analytics.daily_channel_analytics
  -- Daily Analytics Population Query (above) with start_date and end_date parameters
''';
```

2. **Daily Updates**:
```sql
-- Run for previous day's data
DECLARE target_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);

-- Run daily analytics population query for single day
EXECUTE IMMEDIATE '''
  INSERT INTO discord_berachain_analytics.daily_channel_analytics
  -- Daily Analytics Population Query (above) with target_date
''';
```

### Example Time-Series Queries

1. **Channel Growth Over Time**:
```sql
SELECT
  date,
  channel_name,
  total_messages,
  unique_authors,
  new_authors,
  team_engagement_rate
FROM discord_berachain_analytics.daily_channel_analytics
WHERE channel_name = 'general'
ORDER BY date;
```

2. **Team Engagement Trends**:
```sql
SELECT
  date,
  channel_name,
  team_messages,
  team_engagement_rate,
  threads_with_team
FROM discord_berachain_analytics.daily_channel_analytics
WHERE team_messages > 0
ORDER BY date, team_engagement_rate DESC;
```

3. **Content Preservation Tracking**:
```sql
SELECT
  date,
  channel_name,
  messages_with_attachments,
  preserved_attachments,
  preservation_success_rate
FROM discord_berachain_analytics.daily_channel_analytics
WHERE messages_with_attachments > 0
ORDER BY date, preservation_success_rate DESC;
```

## Automation and Maintenance

### Update Schedule
1. **Daily Analytics Update** (runs at 00:30 UTC):
   - Processes previous day's data
   - Updates engagement metrics
   - Calculates new trends

2. **Historical Backfill** (one-time):
   - Processes all data since June 2024
   - Creates baseline metrics
   - Establishes historical trends

### Data Quality Checks
1. **Daily Validation**:
   - Message count consistency
   - Author count validation
   - Engagement metric ranges
   - Thread count verification

2. **Weekly Audits**:
   - Channel coverage
   - Team role verification
   - Attachment preservation status
   - Data completeness check

### Monitoring Queries
```sql
-- Check for missing days
SELECT
  date,
  COUNT(DISTINCT channel_id) as channel_count,
  SUM(total_messages) as total_messages
FROM discord_berachain_analytics.daily_channel_analytics
GROUP BY date
ORDER BY date DESC;

-- Verify metric consistency
SELECT
  date,
  channel_name,
  CASE
    WHEN total_messages < messages_with_reactions + messages_with_replies THEN 'Invalid engagement counts'
    WHEN unique_authors < new_authors + returning_authors THEN 'Invalid author counts'
    WHEN messages_with_attachments < preserved_attachments + unpreserved_attachments THEN 'Invalid attachment counts'
    ELSE 'Valid'
  END as validation_status
FROM discord_berachain_analytics.daily_channel_analytics
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY);
```

## Success Metrics
1. Channel Coverage: % of channels with represented content
2. Engagement Distribution: Even representation across languages/regions
3. Team Interaction Quality: Response times and community feedback
4. Content Preservation: % of media successfully preserved
5. Query Performance: Execution time and resource usage

## Next Steps
1. ✅ Create and validate test tables
2. Create production tables with finalized schema
3. Implement data population queries
4. Set up automated updates
5. Configure monitoring and alerts
