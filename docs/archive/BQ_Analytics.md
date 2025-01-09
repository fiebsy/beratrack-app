# BigQuery Analytics Overview

## What is a View? 
Think of a view like a window or lens through which you look at data:
- It's NOT a table - it doesn't store any data
- It's more like a saved search or filter
- It updates automatically when the source data changes

**Real World Example:**
- Table = Your entire photo library
- View = A filtered collection showing "only beach photos from 2023"
- When you add new beach photos, the view updates automatically

## Why Use Views?
1. **Simplify Complex Queries**: Instead of writing the same long query repeatedly
2. **Real-time Updates**: Always shows fresh data without manual updates
3. **Save Storage**: Don't need to duplicate data
4. **Security**: Can restrict what data users can see

## Our Tables Explained

### 1. Primary Source Tables (Raw Data)
These are like our raw ingredients:

- **discord_berachain.messages**
  - What: Every Discord message ever sent
  - Like: A giant text message history
  - Contains: Message text, who sent it, when, reactions, etc.

- **discord_berachain.channel_metadata**
  - What: Information about each Discord channel
  - Like: A directory of all channels
  - Contains: Channel names, types, permissions

- **discord_berachain.messages_with_attachments**
  - What: Messages that have files/images
  - Like: A photo album with context
  - Contains: Image URLs, file types, message context

### 2. Storage Tables (Our Filing System)

1. **message_translations**
   - **What**: Stores translated messages
   - **Why We Need It**: 
     - Discord has many language channels
     - Need English versions for analysis
     - Can't translate on the fly (too expensive)
   - **Like**: A dictionary of translations

2. **weekly_summaries**
   - **What**: Weekly stats for each channel
   - **Why We Need It**:
     - Calculating stats is computationally expensive
     - Better to calculate once and save
     - Need historical records
   - **Like**: A weekly report card

3. **topic_clusters**
   - **What**: Groups of related messages
   - **Why We Need It**:
     - Need to track discussion themes
     - Messages about same topic spread across channels
     - Hard to analyze in real-time
   - **Like**: A conversation organizer

4. **daily_top_attachments**
   - **What**: Most popular images/files each day
   - **Why We Need It**:
     - Discord links expire
     - Need to preserve popular content
     - Used for social media sharing
   - **Like**: A "best of" photo album

### 3. Our Views (Live Windows into Data)

1. **high_engagement_messages**
   - **What**: Shows popular messages
   - **Why a View**:
     - Popularity changes constantly
     - Need real-time engagement scores
     - Combines data from multiple tables
   - **Like**: A "trending now" page

2. **message_topics**
   - **What**: Current discussion themes
   - **Why a View**:
     - Topics change constantly
     - Need to see current trends
     - Pulls from multiple sources
   - **Like**: A real-time topic tracker

3. **social_media_content**
   - **What**: Twitter-ready posts
   - **Why a View**:
     - Needs latest engagement scores
     - Formats content automatically
     - Combines messages and images
   - **Like**: A social media draft folder

## How It All Works Together

Imagine a Discord message lifecycle:
1. Message sent → Stored in `messages` table
2. If it's popular → Appears in `high_engagement_messages` view
3. If it's in another language → Gets stored in `message_translations`
4. At week's end → Stats go to `weekly_summaries`
5. If it has an image + is popular → Goes to `daily_top_attachments`
6. If it's share-worthy → Appears in `social_media_content` view

## When to Use What

1. **Need Historical Data?**
   - Use tables (they store data permanently)
   - Example: `weekly_summaries` for past reports

2. **Need Real-time Info?**
   - Use views (they're always current)
   - Example: `high_engagement_messages` for trending content

3. **Need to Preserve Something?**
   - Use tables (views don't store anything)
   - Example: `daily_top_attachments` for keeping popular images

4. **Need Combined/Filtered Data?**
   - Use views (they can combine multiple sources)
   - Example: `social_media_content` for formatted posts

## Common Use Cases

1. **Finding Top Content**
   ```sql
   -- Simple way to get top memes
   SELECT * FROM social_media_content
   WHERE channel_name = 'memes'
   ORDER BY engagement_score DESC
   LIMIT 1;
   ```

2. **Weekly Reports**
   ```sql
   -- Get last week's summary
   SELECT * FROM weekly_summaries
   WHERE week_start >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY);
   ```

3. **Language Support**
   ```sql
   -- Get translations
   SELECT original_content, translated_content 
   FROM message_translations
   WHERE original_language = 'ja';
   ```

## Cleanup and Maintenance
- Tables store data permanently until deleted
- Views update automatically
- Test tables can be removed
- Old data archived after 30 days

## Success Metrics
- Fast query response (under 10 seconds)
- Real-time data (under 5 minutes delay)
- Efficient storage use
- Accurate engagement tracking
