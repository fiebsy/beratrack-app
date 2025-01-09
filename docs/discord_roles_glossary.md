# Discord Roles Glossary

## Role Change Tracker

The role change tracker is an automated system that monitors Discord role changes and maintains the glossary. It runs every 2 hours and performs the following functions:

### 1. Tracking Role Changes

The system tracks several types of role changes:
- **Role Additions**: New roles being assigned to users
- **Role Removals**: Roles being removed from users
- **Role Replacements**: When one role is being phased out for another
- **New Roles**: Roles that appear in Discord but aren't in the glossary

### 2. How It Works

#### Monitoring Active Users
- Identifies consistently active users who:
  - Were active 14-15 days ago
  - AND are also active in the last 7 days
- This ensures we track meaningful role changes, not temporary fluctuations

#### Role Status Types
- **OPEN**: Roles that any user can earn (e.g., NFT roles)
- **RESTRICTED**: Special access roles (Team, Moderator, Bot roles)
- **CLOSED**: Roles that are no longer being assigned
- **UNCLEAR**: Roles that need classification

#### Automatic Updates
1. Every 2 hours, the system:
   - Compares role snapshots from 14 days ago vs. last 7 days
   - Records additions and removals
   - Identifies roles missing from the glossary

2. For new roles:
   - Creates draft entries in the glossary
   - Sets initial status as "UNCLEAR"
   - Captures basic metadata (role ID, first seen date)
   - Marks as verified to appear in the UI

### 3. Tables

#### role_change_tracker
Tracks role changes with:
- `role_name`: Name of the role
- `attainability_type`: OPEN/RESTRICTED/CLOSED/UNCLEAR
- `role_id`: Discord's role ID
- `badge`: Role category badge
- `additions`: Number of users who gained the role
- `removals`: Number of users who lost the role
- `last_addition_date`: Most recent addition
- `last_removal_date`: Most recent removal
- `in_glossary`: Whether the role exists in the glossary
- `snapshot_date`: Date of the tracking update

#### glossary_drafts
Temporary table for new roles with:
- Basic role information
- Default "UNCLEAR" status
- Automatic verification
- Initial metrics (0 for activity scores)

### 4. Manual Updates

The system can be triggered manually via an HTTP endpoint:
- URL: `https://us-central1-pickaxe-dashboard.cloudfunctions.net/manualRoleChangeTrackerUpdateV2`
- Returns statistics about changes made
- Useful for immediate updates after role changes

### 5. Best Practices

1. **New Roles**:
   - Automatically added with "UNCLEAR" status
   - Should be reviewed and properly categorized
   - Need descriptions and proper attainability types set

2. **Role Changes**:
   - Monitor the tracker for unexpected changes
   - Review role replacements for accuracy
   - Update documentation for deprecated roles

3. **Maintenance**:
   - Regularly review "UNCLEAR" roles
   - Update descriptions and categories
   - Monitor for role replacements

### 6. Common Queries

```sql
-- Find roles needing documentation
SELECT role_name, additions 
FROM role_change_tracker 
WHERE NOT in_glossary 
ORDER BY additions DESC;

-- Track role lifecycle
SELECT role_name,
       CASE 
         WHEN removals > 0 AND additions = 0 THEN 'DEPRECATED'
         WHEN additions > 0 AND removals = 0 THEN 'NEW'
         ELSE 'TRANSITIONING'
       END as status
FROM role_change_tracker
WHERE last_addition_date IS NOT NULL 
   OR last_removal_date IS NOT NULL;

-- Find potential role replacements
SELECT old.role_name as removed_role, 
       new.role_name as added_role
FROM role_change_tracker old 
JOIN role_change_tracker new 
  ON ABS(old.removals - new.additions) <= 5
WHERE old.removals > 0 
  AND new.additions > 0;
``` 