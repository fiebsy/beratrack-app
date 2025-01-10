# Discord Roles Glossary Table

## Overview

The `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary` table serves as the central repository for Discord role definitions, metadata, and aggregated metrics. This table combines static role information with dynamic engagement metrics to provide a comprehensive view of role performance and community structure.

⚠️ **Important Note on User Counting**: 
The `total_users` column represents role assignments, not unique users. Users can have multiple roles, so summing `total_users` will result in double-counting. For accurate unique user counts, always join with `discord_roles_current` and use `COUNT(DISTINCT author_id)`.

## Quality Score System (Updated Feb 2024)

### Base Score Components (0-100 points)
1. **Message Activity (0-30 points)**
   - 1 point per message up to 30 messages
   - Measures raw participation level

2. **Engagement Quality (0-70 points)**
   - Reactions: Up to 60 points (12 points per reaction/msg, max 5 reactions)
   - Replies: Up to 30 points (15 points per reply/msg, max 2 replies)
   - Thread Creation: Up to 10 points (50 points * thread ratio, max 20% threads)

### Size-Based Multipliers
The system uses role size multipliers to encourage community growth:

1. **Single Member Roles (1 active member)**
   - 0.01x multiplier
   - Effectively zeros out single-member roles
   - Encourages community participation

2. **Small Roles (2-19 active members)**
   - 0.8x multiplier
   - Encourages growth to medium size

3. **Medium Roles (20-99 active members)**
   - 1.0x multiplier (baseline)
   - Standard scoring for established communities

4. **Large Roles (100-499 active members)**
   - 1.2x multiplier
   - Rewards successful community building

5. **Very Large Roles (500+ active members)**
   - 1.5x multiplier
   - Maximum boost for major communities

### Special Role Handling
- **Team/System/Bot/Moderator Roles**: Base score only (no size multiplier)
- These roles can score high but get a "kinda cheating" indicator in the UI

### Final Score Calculation
```sql
CASE 
  -- Single member roles get heavily reduced
  WHEN active_users <= 1 THEN 
    base_quality_score * 0.01
  -- Community roles get size multipliers
  WHEN badge = 'COMMUNITY' THEN 
    CASE 
      WHEN active_users < 20 THEN base_quality_score * 0.8  -- Small groups
      WHEN active_users < 100 THEN base_quality_score       -- Medium groups (baseline)
      WHEN active_users < 500 THEN base_quality_score * 1.2 -- Large groups
      ELSE base_quality_score * 1.5                         -- Very large groups
    END
  -- Other roles keep base score
  ELSE base_quality_score
END as avg_quality_score
```

### Score Interpretation
- **0-25**: Early days (time to level up) [1 bar]
- **25-30**: Solid energy (putting in work) [2 bars]
- **30-35**: Major vibes (going astronomical) [3 bars]
- **35-40**: High key based (absolutely demolishing) [4 bars]
- **40+**: Gigachad energy (mogging the leaderboard) [5 bars]

### Power Meter Visualization
The quality score is visualized using a power meter with 1-5 bars:
1. **1 Bar**: Scores below 25 - Early days
2. **2 Bars**: Scores 25-29 - Solid progress
3. **3 Bars**: Scores 30-34 - Major engagement
4. **4 Bars**: Scores 35-39 - High performance
5. **5 Bars**: Scores 40+ - Maximum energy

Special cases:
- Single member roles always show 1 bar
- Team/System roles maintain normal scaling but get a "kinda cheating" indicator

## Table Schema

```sql
-- Role Identity
role_name: STRING           -- Unique role name
role_id: STRING            -- Discord's role ID
role_category: STRING      -- Role classification category
badge: STRING             -- Display badge type (TEAM, NFT, COMMUNITY, SERVICE, SYSTEM)

-- Role Description
role_description: STRING    -- Detailed role purpose
attainability_type: STRING  -- How role can be obtained
attainability_source: STRING -- Source system/process
attainability_evidence: STRING -- Requirements/evidence needed
is_verified: BOOLEAN       -- Verification status

-- Dynamic Metrics
total_users: INTEGER       -- Total role assignments (NOT unique users)
active_users: INTEGER      -- Active role assignments in last 30 days
active_percentage: FLOAT64 -- Percentage of active assignments
avg_quality_score: FLOAT64 -- Final quality score after size multiplier
last_updated: TIMESTAMP    -- Last metrics update
```

## Update Frequency
- Quality metrics update every 2 hours
- Role assignments update every 30 minutes
- Historical data preserved in `*_old` tables

## Common Queries

### Role Performance Analysis
```sql
-- Get top performing non-system roles
SELECT 
  role_name,
  role_category,
  active_users,
  active_percentage,
  avg_quality_score
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary`
WHERE badge NOT IN ('TEAM', 'SYSTEM')
  AND active_users >= 5  -- Filter out very small roles
ORDER BY avg_quality_score DESC
LIMIT 10;

-- Role category distribution
SELECT 
  role_category,
  COUNT(*) as role_count,
  SUM(active_users) as total_active,
  ROUND(AVG(avg_quality_score), 2) as avg_quality
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary`
GROUP BY role_category
ORDER BY total_active DESC;
```

### Activity Monitoring
```sql
-- Find growing communities
SELECT 
  role_name,
  badge,
  active_users,
  active_percentage,
  avg_quality_score
FROM `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary`
WHERE active_percentage > 50
  AND active_users >= 5
ORDER BY active_percentage DESC;
```

## Best Practices

1. **Query Optimization**
   - Filter out very small roles for meaningful analysis
   - Consider activity thresholds based on use case
   - Use appropriate role categories for segmentation

2. **Data Integration**
   - Join with `discord_roles_current` for user-level details
   - Consider update timing for real-time analysis
   - Use role_id for Discord API integration

3. **Metric Analysis**
   - Account for size multipliers in comparisons
   - Consider role categories when comparing scores
   - Use active_percentage for relative comparisons

## Related Tables
- `discord_roles_current` - User-level role and quality data
- `discord_roles_view` - Current role assignments
- `messages` - Source for activity metrics
