# **Roles Page Implementation Log**

## **1. Initial Requirements & Evolution**

### Original Requirements
- Role Name
- Total Users
- Active Users
- Engagement Rate
- Rating (Activity + Rarity)

### Evolution & Discoveries
1. **Data Timeframe Insight**
   - Initially planned for active vs total users
   - Discovered data only spans recent weeks
   - Pivoted to focus on % of total active users instead

2. **Engagement Metrics Exploration**
   - Found rich data in messages table:
     ```sql
     -- Key fields discovered
     message_id
     channel_id
     author_id
     author_roles
     reaction_count
     reply_count
     thread_id
     is_thread_starter
     unique_reactors
     unique_repliers
     ```

## **2. Query Development**

### Stage 1: Basic Role Stats
```sql
WITH total_active_users AS (
  SELECT COUNT(DISTINCT author_id) as total_active 
  FROM discord_berachain.messages 
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
)
```
- Establishes baseline of total active users
- Uses 90-day window for relevance

### Stage 2: Role Engagement Metrics
```sql
role_engagement AS (
  SELECT 
    r.name as role_name,
    COUNT(DISTINCT m.author_id) as users_with_role,
    COUNT(*) as total_messages,
    COUNT(DISTINCT m.channel_id) as channels_active,
    AVG(m.reaction_count) as avg_reactions,
    AVG(m.reply_count) as avg_replies,
    COUNT(DISTINCT m.thread_id) as threads_participated,
    COUNT(DISTINCT CASE WHEN m.is_thread_starter THEN m.thread_id END) as threads_started
  FROM discord_berachain.messages m
  CROSS JOIN UNNEST(m.author_roles) r
  WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
  GROUP BY r.name
)
```
- Captures comprehensive engagement metrics
- Tracks both thread participation and creation
- Measures reaction and reply engagement

### Stage 3: Rating Formula Evolution
Current formula weights (25% each):
1. Role Rarity: `(1 - users_with_role/total_active)`
2. Message Engagement: `(avg_reactions + avg_replies) relative to max`
3. Thread Participation: `threads_participated relative to max`
4. Activity Level: `messages_per_user relative to max`

## **3. UI Implementation**

### Key Components
1. **Data Table**
   - Uses TanStack Table for sorting and formatting
   - Client-side component with server data fetching
   - Responsive design with mobile considerations

2. **Column Structure**
   ```typescript
   interface RoleStats {
     role_name: string;
     users_with_role: number;
     percent_of_active_users: number;
     role_rating: number;
     total_messages: number;
     messages_per_user: number;
     channels_active: number;
     threads_participated: number;
     avg_reactions: number;
     avg_replies: number;
   }
   ```

3. **Visual Elements**
   - Progress bars for percentages
   - Colored badges for ratings
   - Number formatting for readability

## **4. Automation & Updates**

### Current Update Process
1. BigQuery fetches data with 90-day window
2. Page revalidates every hour
3. Dynamic updates through Next.js App Router

### Future Automation Needs
1. [ ] Scheduled BigQuery materialized views
2. [ ] Caching layer for frequent requests
3. [ ] Real-time updates for critical metrics

## **5. Next Steps**

### Immediate Tasks
1. [ ] Optimize query performance
2. [ ] Add role categorization
3. [ ] Implement trend indicators

### Future Enhancements
1. [ ] Historical trend analysis
2. [ ] Role progression tracking
3. [ ] Integration with role management

## **6. Technical Notes**

### Dependencies
- @tanstack/react-table
- shadcn/ui components
- BigQuery client

### Environment Requirements
```typescript
// Required env variables
GOOGLE_CLOUD_PROJECT
GOOGLE_APPLICATION_CREDENTIALS // For Vercel deployment
```

### Query Performance
- Current query cost: ~1GB processed
- Average runtime: TBD
- Optimization opportunities: TBD
