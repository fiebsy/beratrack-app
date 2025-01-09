# Discord Role Change Tracker

## Overview

The `pickaxe-dashboard.discord_berachain_roles.role_change_tracker` table tracks role changes among consistently active users in the Discord server. It specifically identifies role transitions, replacements, and removals by comparing user roles from two time points.

## Purpose

This table serves several key purposes:
1. Identify role replacements (e.g., when one role is being phased out for another)
2. Track removal of deprecated roles
3. Monitor introduction of new roles
4. Support updates to the `discord_roles_glossary` table

## Table Information

- **Dataset**: `discord_berachain_roles`
- **Table**: `role_change_tracker`
- **Update Frequency**: Daily
- **Time Window**: 14-day comparison window
- **Focus**: Changes for consistently active users only

## Schema

```sql
role_name: STRING           -- Name of the role
attainability_type: STRING  -- From glossary (OPEN, CLOSED, UNCLEAR)
role_id: STRING            -- Discord role ID from glossary
badge: STRING             -- Badge information from glossary
additions: INTEGER        -- Number of active users who gained this role
removals: INTEGER         -- Number of active users who lost this role
last_addition_date: DATE  -- Date of most recent addition
last_removal_date: DATE   -- Date of most recent removal
in_glossary: BOOLEAN     -- Whether role exists in glossary
snapshot_date: DATE       -- Date of the analysis
```

## Methodology

The table is created using a multi-step process to ensure accurate tracking of role changes:

1. **Identify Consistently Active Users**:
```sql
WITH consistently_active_users AS (
    SELECT DISTINCT m1.author_id 
    FROM messages m1 
    WHERE m1.timestamp BETWEEN 
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 DAY) 
        AND TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY) 
    AND EXISTS (
        SELECT 1 
        FROM messages m2 
        WHERE m2.author_id = m1.author_id 
        AND m2.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
    )
)
```
This identifies users who were active both 14 days ago AND in the last 7 days.

2. **Capture Role States**:
```sql
roles_14days_ago AS (
    SELECT m.author_id, 
           ARRAY_AGG(DISTINCT role.name) as old_roles 
    FROM messages m, 
    UNNEST(m.author_roles) as role 
    WHERE m.timestamp BETWEEN 
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 DAY) 
        AND TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY) 
    AND m.author_id IN (SELECT author_id FROM consistently_active_users) 
    GROUP BY author_id
),
roles_last_7days AS (
    SELECT m.author_id, 
           ARRAY_AGG(DISTINCT role.name) as recent_roles 
    FROM messages m, 
    UNNEST(m.author_roles) as role 
    WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) 
    AND m.author_id IN (SELECT author_id FROM consistently_active_users) 
    GROUP BY author_id
)
```

3. **Calculate Changes**:
```sql
role_stats AS (
    SELECT role_name, 
           COUNT(*) as times_added,
           CURRENT_DATE() as snapshot_date,
           MIN(m.timestamp) as first_addition,
           MAX(m.timestamp) as last_addition
    FROM role_changes rc
    JOIN `pickaxe-dashboard.discord_berachain.messages` m 
      ON rc.author_id = m.author_id
    CROSS JOIN UNNEST(recent_roles) as role_name 
    WHERE role_name NOT IN UNNEST(old_roles) 
      AND role.name = role_name
    GROUP BY role_name
),
role_removals AS (
    SELECT role_name, 
           COUNT(*) as times_removed,
           CURRENT_DATE() as snapshot_date,
           MIN(m.timestamp) as first_removal,
           MAX(m.timestamp) as last_removal
    FROM role_changes rc
    JOIN `pickaxe-dashboard.discord_berachain.messages` m 
      ON rc.author_id = m.author_id
    CROSS JOIN UNNEST(old_roles) as role_name 
    WHERE role_name NOT IN UNNEST(recent_roles)
      AND role.name = role_name
    GROUP BY role_name
),
final_stats AS (
    SELECT 
        COALESCE(a.role_name, r.role_name) as role_name,
        g.attainability_type,
        g.role_id,
        g.badge,
        COALESCE(a.times_added, 0) as additions,
        COALESCE(r.times_removed, 0) as removals,
        DATE(a.last_addition) as last_addition_date,
        DATE(r.last_removal) as last_removal_date,
        g.role_id IS NOT NULL as in_glossary,
        COALESCE(a.snapshot_date, r.snapshot_date) as snapshot_date
    FROM role_stats a 
    FULL OUTER JOIN role_removals r 
      ON a.role_name = r.role_name
    LEFT JOIN `pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary` g 
      ON COALESCE(a.role_name, r.role_name) = g.role_name
    WHERE COALESCE(a.times_added, 0) + COALESCE(r.times_removed, 0) > 0
)
```

## Usage Examples

### Finding Role Replacements
```sql
SELECT old.role_name as removed_role, 
       new.role_name as added_role,
       old.removals, new.additions
FROM role_change_tracker old 
JOIN role_change_tracker new 
  ON ABS(old.removals - new.additions) <= 5
WHERE old.removals > 0 
  AND new.additions > 0
ORDER BY old.removals DESC
```

### Identifying New Roles
```sql
SELECT role_name, additions 
FROM role_change_tracker 
WHERE additions > 0 
  AND role_id IS NULL
ORDER BY additions DESC
```

### Finding Roles Missing from Glossary
```sql
SELECT role_name, 
       additions,
       removals,
       last_addition_date,
       last_removal_date
FROM role_change_tracker 
WHERE NOT in_glossary
  AND (additions > 0 OR removals > 0)
ORDER BY additions + removals DESC
```

### Tracking Role Lifecycle
```sql
SELECT role_name,
       additions,
       removals,
       last_addition_date,
       last_removal_date,
       CASE 
         WHEN removals > 0 AND additions = 0 THEN 'DEPRECATED'
         WHEN additions > 0 AND removals = 0 THEN 'NEW'
         ELSE 'TRANSITIONING'
       END as status
FROM role_change_tracker
WHERE last_addition_date IS NOT NULL 
   OR last_removal_date IS NOT NULL
ORDER BY COALESCE(last_addition_date, last_removal_date) DESC
```

## Notes

- The table only tracks changes for users who were active both 14 days ago and recently
- Role changes are counted based on comparison of exact snapshots, not daily fluctuations
- Perfect role replacements will show nearly identical addition/removal counts
- New roles will show only additions, deprecated roles will show only removals
- The snapshot_date field indicates when the change was detected
  - For new roles or additions: The date the role was first seen in the 7-day window
  - For removed roles: The date the removal was detected
  - NULL snapshot_dates should not occur in production and indicate a need to refresh the table
- `last_addition_date` and `last_removal_date` help track the timeline of role changes
- `in_glossary` flag helps identify roles that need to be added to the glossary
- Roles with high activity but missing from glossary should be prioritized for documentation
