# Discord Roles Glossary Documentation

## Table Schema

The glossary table (`discord_roles_glossary`) contains the following columns:

### Core Fields
- `role_id` (STRING) - Unique Discord role ID
- `role_name` (STRING) - Display name of the role
- `role_category` (STRING) - Category classification (e.g., NFT Holder, Community, Team)
- `role_description` (STRING) - Detailed description of the role's purpose
- `badge` (STRING) - Display badge category (TEAM, NFT, COMMUNITY, SERVICE, SYSTEM)

### Attainability Fields
- `attainability_type` (STRING) - How the role can be obtained (e.g., NFT, ACHIEVEMENT, SPECIAL)
- `attainability_source` (STRING) - Source system or process for obtaining the role
- `attainability_evidence` (STRING) - Specific requirements or evidence needed

### Activity Metrics
- `active_users` (INT64) - Count of users with messages in last 30 days
- `total_users` (INT64) - Total number of users with the role
- `active_percentage` (FLOAT64) - Percentage of role members who are active
- `avg_quality_score` (FLOAT64) - Base quality score before size weighting
- `weighted_score` (FLOAT64) - Final score after size multiplier

### Metadata
- `last_updated` (TIMESTAMP) - When the role was last updated
- `is_verified` (BOOLEAN) - Whether the role info has been verified

## Role Categories

1. **NFT Holder**
   - For NFT collection holders
   - Verified through Discord bot
   - Example: "BIG TIME Bera"

2. **Community**
   - General community participation roles
   - Based on activity or achievements
   - Example: "Supper Clupe"

3. **Team**
   - Official team and moderator roles
   - Excluded from quality rankings
   - Example: "Core Team"

4. **Service**
   - External service providers and partners
   - Manually assigned
   - Example: "Validator"

5. **System**
   - Technical and bot roles
   - Excluded from quality rankings
   - Example: "Verification Bot"

## Quality Score System

The quality score system combines individual engagement and group dynamics:

1. **Individual Components (0-80 points)**
   - Base Activity: 1 point per message (max 30)
   - Reactions: 5 points per reaction/msg (max 25)
   - Replies: 5 points per reply/msg (max 15)
   - Threads: Thread ratio * 50 (max 10)

2. **Size Multipliers**
   - <5 active: 0.5x
   - 5-19 active: 0.8x
   - 20-99 active: 1.0x
   - 100-499 active: 1.2x
   - 500+ active: 1.5x

3. **Final Categories**
   - gigachad (40+): Top communities
   - based (30-40): Major players
   - comfy (20-30): Active communities
   - wagmi (10-20): Growing communities
   - smol (0-10): Emerging groups

## Example Queries

1. Get role distribution by tier:
```sql
SELECT 
  CASE 
    WHEN active_users < 5 THEN 'Very Small'
    WHEN active_users < 20 THEN 'Small'
    WHEN active_users < 100 THEN 'Medium'
    WHEN active_users < 500 THEN 'Large'
    ELSE 'Very Large'
  END as size_tier,
  COUNT(*) as role_count,
  ROUND(AVG(avg_quality_score), 2) as avg_base_score,
  ROUND(AVG(weighted_score), 2) as avg_weighted_score
FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
WHERE badge NOT IN ('TEAM', 'SYSTEM')
AND role_category NOT IN ('Bot', 'Moderator')
GROUP BY size_tier
ORDER BY MIN(active_users);
```

2. Get top NFT roles:
```sql
SELECT 
  role_name,
  active_users,
  total_users,
  ROUND(active_users * 100.0 / total_users, 2) as active_pct,
  avg_quality_score as base_score,
  weighted_score
FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
WHERE badge = 'NFT'
ORDER BY weighted_score DESC
LIMIT 10;
```

## Best Practices

1. **Role Management**
   - Keep descriptions current
   - Verify attainability evidence
   - Monitor size transitions

2. **Data Updates**
   - Check last_updated timestamps
   - Verify new roles promptly
   - Track multiplier effects

3. **Quality Monitoring**
   - Review weighted scores
   - Track tier distributions
   - Monitor size category changes
