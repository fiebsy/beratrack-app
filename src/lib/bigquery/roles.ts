import { BigQuery } from '@google-cloud/bigquery';
import type { RoleStats } from '@/app/roles-table/columns';
import type { RoleCategory } from '@/lib/roles/known-roles';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'pickaxe-dashboard',
  ...(process.env.VERCEL
    ? {
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')
      }
    : {
        keyFilename: './service-account.json'
      }),
  location: 'US'
});

/**
 * Fetches role statistics with dual rating system:
 * 1. Engagement Rating:
 *    - 25% Role rarity
 *    - 25% Message engagement (reactions + replies)
 *    - 25% Thread participation
 *    - 25% Activity level (messages per user)
 * 
 * 2. Attainability Rating:
 *    - Community: 70% user prevalence + 30% thread starter ratio
 *    - NFT Holder: 100% (purchasable)
 *    - Team/Moderator/Bot: 0% (not generally attainable)
 *    - Unknown: 0% (not defined)
 * 
 * @returns Promise<RoleStats[]> Array of role statistics
 */
export async function getRoleStats(): Promise<RoleStats[]> {
  const query = `
    WITH role_categories AS (
      SELECT "Team" as category, [
        "Team",
        "Admin"
      ] as roles
      UNION ALL
      SELECT "Moderator" as category, [
        "Mod Lead",
        "Mod"
      ] as roles
      UNION ALL
      SELECT "Helper" as category, [
        "Bera Helper",
        "Super Helper"
      ] as roles
      UNION ALL
      SELECT "Community" as category, [
        "Bera Cub",
        "Super Cub",
        "Bug Blaster",
        "Helpful Opinion Leader",
        "Helpful Opinion Leader - ARTIST",
        "Helpful Opinion Leader - CONTENT",
        "Helpful Opinion Leader - COMMUNITY",
        "Princess",
        "I'm good at poker",
        "Nothing",
        "Actually Nothing",
        "Absolutely Nothing",
        "Truly Nothing",
        "Certified Nothing",
        "Nothing Premium+"
      ] as roles
      UNION ALL
      SELECT "NFT Holder" as category, [
        "Verified OG Bong Bear Holder",
        "Verified Bear Holder - Any Collection",
        "Original Gangster",
        "Bera",
        "Jarred Up",
        "YeeTARDED",
        "Smilee Bera",
        "HoneyPOTTED",
        "Junky URSA",
        "Beratone FOUNDER'S Edition",
        "BeraDROMER",
        "Ramen Bera",
        "Beraborrower",
        "Beramonium HOLDER",
        "Beradelic - BeraSig",
        "Berahorse Jockey",
        "Berally Tripper",
        "Memeswap Bruv",
        "BurrBear Printooor",
        "Fable Bera",
        "BeraPong House",
        "CubHUB'd",
        "Onikuma Bera",
        "Beracian",
        "BeraBOY",
        "BeraPUNK",
        "BeraSwap",
        "BeraPaw",
        "BeraRoot",
        "Holistic BERA",
        "Narra Bera",
        "Wizwoods Bera",
        "Booga Bera",
        "Happee Bera",
        "PumpBera",
        "OasisOpus",
        "Wagmibera",
        "BeraDeluna-Beraji Bears",
        "Satori",
        "Berautistics",
        "Pret's Bera",
        "Skemmy Bera",
        "Hornee Bera",
        "AZEx Bera"
      ] as roles
      UNION ALL
      SELECT "Bot" as category, [
        "MEE6",
        "MEE6_BOT",
        "DYNO",
        "DYNO_BOT",
        "WICK",
        "WICK_BOT"
      ] as roles
      UNION ALL
      SELECT "Governance" as category, [
        "Governance Pings",
        "Proposal Pings"
      ] as roles
      UNION ALL
      SELECT "System" as category, [
        "%100 Real User"
      ] as roles
    ),
    total_active_users AS (
      SELECT COUNT(DISTINCT author_id) as total_active 
      FROM discord_berachain.messages 
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
    ),
    role_engagement AS (
      SELECT 
        r.name as role_name,
        COUNT(DISTINCT m.author_id) as users_with_role,
        COUNT(*) as total_messages,
        AVG(m.reaction_count) as avg_reactions,
        AVG(m.reply_count) as avg_replies,
        COUNT(DISTINCT m.thread_id) as threads_participated,
        COUNT(DISTINCT CASE WHEN m.is_thread_starter THEN m.thread_id END) as threads_started
      FROM discord_berachain.messages m
      CROSS JOIN UNNEST(m.author_roles) r
      WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
      GROUP BY r.name
    ),
    role_stats AS (
      SELECT 
        re.*,
        COALESCE(rc.category, 'Unknown') as category,
        ROUND(SAFE_DIVIDE(users_with_role, (SELECT total_active FROM total_active_users)) * 100, 1) as percent_of_active_users,
        ROUND(SAFE_DIVIDE(total_messages, users_with_role), 1) as messages_per_user,
        ROUND(
          (
            (1 - SAFE_DIVIDE(users_with_role, (SELECT total_active FROM total_active_users))) * 0.25 +  -- Role rarity
            SAFE_DIVIDE(avg_reactions + avg_replies, MAX(avg_reactions + avg_replies) OVER()) * 0.25 +  -- Message engagement
            SAFE_DIVIDE(threads_participated, MAX(threads_participated) OVER()) * 0.25 +  -- Thread participation
            SAFE_DIVIDE(total_messages, users_with_role) / MAX(SAFE_DIVIDE(total_messages, users_with_role)) OVER() * 0.25  -- Activity level
          ) * 100,
          1
        ) as engagement_rating,
        CASE 
          WHEN rc.category = 'Community' THEN 
            ROUND(
              (
                SAFE_DIVIDE(users_with_role, (SELECT total_active FROM total_active_users)) * 0.7 +  -- User prevalence
                SAFE_DIVIDE(threads_started, NULLIF(threads_participated, 0)) * 0.3  -- Thread starter ratio
              ) * 100,
              1
            )
          WHEN rc.category = 'Helper' THEN 
            ROUND(
              (
                SAFE_DIVIDE(users_with_role, (SELECT total_active FROM total_active_users)) * 0.7 +  -- User prevalence
                SAFE_DIVIDE(threads_started, NULLIF(threads_participated, 0)) * 0.3  -- Thread starter ratio
              ) * 100,
              1
            )
          WHEN rc.category = 'NFT Holder' THEN 100  -- Always attainable through purchase
          WHEN rc.category IN ('Team', 'Moderator', 'Bot', 'System', 'Unknown') THEN 0  -- Not generally attainable
          ELSE 0
        END as attainability_rating
      FROM role_engagement re
      LEFT JOIN role_categories rc ON re.role_name IN UNNEST(rc.roles)
    )
    SELECT *
    FROM role_stats
    WHERE users_with_role > 0
    ORDER BY engagement_rating DESC
  `;

  try {
    console.log('Executing role stats query...');
    const [rows] = await bigquery.query({ 
      query,
      location: 'US',
      maximumBytesBilled: "1000000000" // 1GB limit
    });
    
    console.log(`Query completed. Processing ${rows?.length || 0} rows...`);
    
    return rows.map(row => ({
      role_name: row.role_name as string,
      category: row.category as RoleCategory,
      users_with_role: Number(row.users_with_role),
      percent_of_active_users: Number(row.percent_of_active_users),
      engagement_rating: Number(row.engagement_rating),
      attainability_rating: Number(row.attainability_rating),
      total_messages: Number(row.total_messages),
      messages_per_user: Number(row.messages_per_user),
      threads_participated: Number(row.threads_participated),
      avg_reactions: Number(row.avg_reactions),
      avg_replies: Number(row.avg_replies)
    }));
  } catch (error) {
    console.error('BigQuery Error in getRoleStats:', error);
    throw new Error(`Failed to fetch role statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 