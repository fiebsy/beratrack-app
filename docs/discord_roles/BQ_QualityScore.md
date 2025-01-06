# Discord Quality Score Documentation

This document outlines the quality score system used to measure user engagement and role quality in the Discord server.

## Overview

The quality score system measures both individual user engagement and group dynamics, using a weighted system that rewards both high-quality individual participation and active community size.

## Individual Score Components (0-80 base points)

1. **Base Activity (30 points max)**
   - 1 point per message up to 30
   - Minimum 5 messages for scoring
   - Example: 20 messages = 20 points

2. **Reactions Component (25 points max)**
   - 5 points per average reaction per message
   - Example: 3 reactions/msg = 15 points

3. **Replies Component (15 points max)**
   - 5 points per average reply per message
   - Example: 2 replies/msg = 10 points

4. **Thread Creation (10 points max)**
   - 50 points * thread starter ratio
   - Example: 15% thread starter = 7.5 points

## Group Size Multipliers

Role scores are weighted based on active member count:

- **Very Small Groups** (<5 active)
  - 0.5x multiplier
  - Prevents small groups from dominating rankings

- **Small Groups** (5-19 active)
  - 0.8x multiplier
  - Slight penalty for limited size

- **Medium Groups** (20-99 active)
  - 1.0x multiplier
  - Baseline for normal communities

- **Large Groups** (100-499 active)
  - 1.2x multiplier
  - Bonus for maintaining engagement at scale

- **Very Large Groups** (500+ active)
  - 1.5x multiplier
  - Significant bonus for major communities

## Score Categories

Roles are categorized based on their final weighted scores:

- **gigachad** (40+)
  - Top-tier communities
  - Massive engagement with high activity
  - Example: Major NFT communities

- **based** (30-40)
  - High-performing communities
  - Strong engagement and size
  - Example: Active project communities

- **comfy** (20-30)
  - Solid active communities
  - Good engagement levels
  - Example: Established groups

- **wagmi** (10-20)
  - Growing communities
  - Building engagement
  - Example: Newer projects

- **smol** (0-10)
  - Emerging communities
  - Early stage engagement
  - Example: New roles

## Example Queries

1. Get role quality distribution:
```sql
WITH role_metrics AS (
  SELECT 
    role_name,
    badge,
    role_category,
    active_users,
    avg_quality_score * CASE 
      WHEN active_users < 5 THEN 0.5
      WHEN active_users < 20 THEN 0.8
      WHEN active_users < 100 THEN 1.0
      WHEN active_users < 500 THEN 1.2
      ELSE 1.5
    END as weighted_score
  FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
  WHERE badge NOT IN ('TEAM', 'SYSTEM')
  AND role_category NOT IN ('Bot', 'Moderator')
)
SELECT 
  CASE 
    WHEN weighted_score >= 40 THEN 'gigachad'
    WHEN weighted_score >= 30 THEN 'based'
    WHEN weighted_score >= 20 THEN 'comfy'
    WHEN weighted_score >= 10 THEN 'wagmi'
    ELSE 'smol'
  END as tier,
  COUNT(*) as role_count,
  ROUND(AVG(active_users), 1) as avg_active_users
FROM role_metrics
GROUP BY tier
ORDER BY MIN(weighted_score) DESC;
```

2. Get top community roles:
```sql
SELECT 
  role_name,
  badge,
  active_users,
  avg_quality_score as base_score,
  ROUND(avg_quality_score * CASE 
    WHEN active_users < 5 THEN 0.5
    WHEN active_users < 20 THEN 0.8
    WHEN active_users < 100 THEN 1.0
    WHEN active_users < 500 THEN 1.2
    ELSE 1.5
  END, 2) as weighted_score
FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
WHERE badge NOT IN ('TEAM', 'SYSTEM')
AND role_category NOT IN ('Bot', 'Moderator')
ORDER BY weighted_score DESC
LIMIT 10;
```

## Best Practices

1. **Score Interpretation**
   - Focus on weighted scores for role comparison
   - Consider both individual and group metrics
   - Account for role size in analysis

2. **Role Analysis**
   - Monitor distribution across tiers
   - Track changes in weighted scores
   - Consider size transitions

3. **Data Quality**
   - Verify role categorization
   - Monitor size multiplier effects
   - Track score component ratios
