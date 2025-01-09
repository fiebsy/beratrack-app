# Discord Roles Current Table

## Overview

The `pickaxe-dashboard.discord_berachain_roles.discord_roles_current` table maintains the current state of Discord user roles and their quality metrics. This table serves as the primary source for role-based analytics and user engagement tracking.

## Table Information

- **Dataset**: `discord_berachain_roles`
- **Table**: `discord_roles_current`
- **Update Frequency**: Every 30 minutes (roles), Every 2 hours (quality scores)
- **Row Count**: ~18.4K users
- **Average Quality Score**: ~6.75

## Schema

```sql
author_id: STRING         -- Discord user ID
author_name: STRING      -- Current Discord username
author_avatar_url: STRING -- User's avatar URL
author_roles: RECORD[] {  -- Array of current role assignments
  id: STRING,           -- Role ID
  name: STRING         -- Role name
}
message_id: STRING      -- Latest message ID from user
timestamp: TIMESTAMP   -- Timestamp of latest message
quality_score: FLOAT64 -- User's engagement quality score
```

## Firebase Function Implementation (as of Jan 8, 2025)

### Role Updates (`discord-roles.ts`)
- **Frequency**: Every 30 minutes
- **Function**: `scheduledRolesUpdateV2`
- **Process**:
  1. Queries `discord_roles_view` for latest role assignments
  2. Processes results in 500-row chunks
  3. Updates Firebase Realtime Database
  4. Maintains searchable tokens for usernames
  5. Tracks last active timestamp

### Quality Score Updates (`quality-scores.ts`)
- **Frequency**: Every 2 hours
- **Function**: `scheduledQualityScoresUpdateV2`
- **Scoring Components**:
  1. Base Activity (0-50 points)
     - 1 point per message (max 30)
     - Size bonus up to 20 points
  2. Engagement Quality (0-50 points)
     - Reactions: 5 points per reaction/msg (max 25)
     - Replies: 5 points per reply/msg (max 15)
     - Threads: 50 points * thread ratio (max 10)

### Activity Stats Updates (`activity-stats.ts`)
- **Frequency**: Every 2 hours
- **Function**: `scheduledRoleStatsUpdateV2`
- **Metrics Updated**:
  - Active user counts
  - Total user counts
  - Activity percentages
  - Role-level statistics

## Update Process Details

### Role Data Flow
```
discord_roles_view
    ↓
updateDiscordRoles()
    ↓
processAndUpdateFirebase()
    ↓
Firebase Realtime DB
```

### Quality Score Calculation
```sql
CASE
  WHEN message_count = 0 THEN 0
  WHEN message_count < 5 THEN 1
  ELSE ROUND(
    -- Base Activity (30 points max)
    LEAST(message_count, 30) +
    -- Engagement (50 points max)
    LEAST(reactions_per_msg * 5, 25) +
    LEAST(replies_per_msg * 5, 15) +
    LEAST(thread_ratio * 50, 10),
    2
  )
END as quality_score
```

### Size Multipliers
- <5 active: 0.5x (very small groups)
- 5-19 active: 0.8x (small groups)
- 20-99 active: 1.0x (medium groups)
- 100-499 active: 1.2x (large groups)
- 500+ active: 1.5x (very large groups)

## Usage Examples

### Basic Role Analysis
```sql
-- Get distribution of quality scores
SELECT 
  FLOOR(quality_score/10)*10 as score_bracket,
  COUNT(*) as user_count
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_current`
WHERE quality_score > 0
GROUP BY score_bracket
ORDER BY score_bracket;

-- Find top contributors
SELECT 
  author_name,
  quality_score,
  ARRAY_LENGTH(author_roles) as role_count
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_current`
WHERE quality_score > 0
ORDER BY quality_score DESC
LIMIT 10;
```

### Role Distribution Analysis
```sql
-- Get role membership counts
SELECT 
  r.name as role_name,
  COUNT(*) as member_count,
  AVG(c.quality_score) as avg_quality
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_current` c,
UNNEST(c.author_roles) r
GROUP BY role_name
ORDER BY member_count DESC;
```

## Best Practices

1. **Query Optimization**
   - Filter by quality_score > 0 for active users
   - Use UNNEST for role analysis
   - Consider timestamp for temporal analysis

2. **Data Integration**
   - Join with messages table for detailed analysis
   - Use author_id for user tracking
   - Consider role updates timing

3. **Quality Score Analysis**
   - Account for size multipliers
   - Consider update frequency
   - Use appropriate score brackets

## Related Tables/Views

- `discord_roles_view` - Source for role updates
- `discord_roles_glossary` - Role metadata and statistics
- `messages` - Source for activity metrics

## Notes

- Quality scores are recalculated every 2 hours
- Role assignments update every 30 minutes
- Scores reflect 30-day activity window
- Size multipliers affect final quality metrics
