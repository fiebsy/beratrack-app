import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { BigQuery } from '@google-cloud/bigquery';

/**
 * Calculates quality scores for all users and updates role-level metrics
 * 
 * Quality Score Components:
 * 1. Base Activity (0-50 points)
 *    - Message count: 1 point per message up to 30
 *    - Size bonus: Up to 20 points based on active users
 * 2. Engagement Quality (0-50 points)
 *    - Reactions: 5 points per reaction/msg up to 25 points
 *    - Replies: 5 points per reply/msg up to 15 points  
 *    - Threads: 50 points * thread ratio up to 10 points
 * 
 * Size Multiplier:
 * - <5 active: 0.5x (very small groups)
 * - 5-19 active: 0.8x (small groups)
 * - 20-99 active: 1.0x (medium groups)
 * - 100-499 active: 1.2x (large groups)
 * - 500+ active: 1.5x (very large groups)
 * 
 * Final score ranges:
 * 0-20: Minimal engagement
 * 20-40: Regular engagement
 * 40-60: Active community
 * 60-80: High engagement hub  
 * 80-100: Top community center
 */
export async function updateQualityScores() {
  const client = new BigQuery();
  console.log('Starting quality scores update...');

  try {
    // First update user scores
    console.log('Updating user quality scores...');
    const userScoresQuery = `
      MERGE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_current\` T
      USING (
        WITH latest_names AS (
          SELECT DISTINCT
            author_id,
            LAST_VALUE(author_name) OVER (
              PARTITION BY author_id
              ORDER BY timestamp
              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
            ) as author_name
          FROM \`pickaxe-dashboard.discord_berachain.messages\`
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        ),
        user_metrics AS (
          SELECT
            ln.author_id,
            ln.author_name,
            COUNT(*) as message_count,
            AVG(m.reaction_count) as reactions_per_msg,
            AVG(m.reply_count) as replies_per_msg,
            COUNTIF(m.is_thread_starter) / COUNT(*) as thread_ratio
          FROM \`pickaxe-dashboard.discord_berachain.messages\` m
          JOIN latest_names ln ON m.author_id = ln.author_id
          WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
          GROUP BY ln.author_id, ln.author_name
        )
        SELECT
          author_id,
          author_name,
          message_count,
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
        FROM user_metrics
      ) S
      ON T.author_id = S.author_id
      WHEN MATCHED THEN
        UPDATE SET 
          quality_score = S.quality_score,
          author_name = S.author_name
      WHEN NOT MATCHED THEN
        INSERT (author_id, author_name, quality_score)
        VALUES (S.author_id, S.author_name, S.quality_score)
    `;
    const [userScoresJob] = await client.createQueryJob({
      query: userScoresQuery,
      location: 'US',
      maximumBytesBilled: "1000000000"
    });
    const [userResults] = await userScoresJob.getQueryResults();
    console.log('User scores update completed:', {
      timestamp: new Date().toISOString(),
      rowsAffected: userResults.length
    });

    // Create a new table with the latest metrics
    console.log('Creating new glossary table...');
    const createNewTableQuery = `
      CREATE OR REPLACE TABLE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_new\` AS
      WITH existing_data AS (
        SELECT
          role_id,
          role_name,
          role_category,
          role_description,
          attainability_type,
          attainability_source,
          attainability_evidence,
          is_verified,
          badge
        FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
      ),
      latest_roles AS (
        SELECT DISTINCT
          author_id,
          role.name as role_name
        FROM \`pickaxe-dashboard.discord_berachain.messages\` m,
        UNNEST(m.author_roles) role
      ),
      active_messages AS (
        SELECT DISTINCT
          author_id,
          role.name as role_name
        FROM \`pickaxe-dashboard.discord_berachain.messages\` m,
        UNNEST(m.author_roles) role
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      ),
      total_active AS (
        SELECT COUNT(DISTINCT author_id) as total_active_users
        FROM \`pickaxe-dashboard.discord_berachain.messages\`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      ),
      role_metrics AS (
        SELECT
          r.role_name,
          COUNT(DISTINCT r.author_id) as total_users,
          COUNT(DISTINCT am.author_id) as active_users,
          ROUND(AVG(CASE WHEN c.quality_score > 0 THEN c.quality_score END), 2) as base_quality_score
        FROM latest_roles r
        LEFT JOIN active_messages am 
          ON r.role_name = am.role_name AND r.author_id = am.author_id
        LEFT JOIN \`pickaxe-dashboard.discord_berachain_roles.discord_roles_current\` c
          ON r.author_id = c.author_id
        GROUP BY r.role_name
      ),
      role_info AS (
        SELECT r.*, g.badge, g.role_category 
        FROM role_metrics r 
        LEFT JOIN \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` g 
          ON r.role_name = g.role_name
      ),
      weighted_metrics AS (
        SELECT
          role_name,
          total_users,
          active_users,
          base_quality_score,
          -- Add size multiplier only for non-system roles
          CASE 
            WHEN badge NOT IN ('TEAM', 'SYSTEM') AND role_category NOT IN ('Bot', 'Moderator') THEN
              CASE 
                WHEN active_users < 5 THEN base_quality_score * 0.5  -- Very small groups
                WHEN active_users < 20 THEN base_quality_score * 0.8 -- Small groups
                WHEN active_users < 100 THEN base_quality_score * 1.0 -- Medium groups
                WHEN active_users < 500 THEN base_quality_score * 1.2 -- Large groups
                ELSE base_quality_score * 1.5 -- Very large groups
              END
            ELSE base_quality_score -- Keep original score for system roles
          END as avg_quality_score
        FROM role_info
      )
      SELECT
        COALESCE(e.role_name, m.role_name) as role_name,
        e.role_id,
        e.role_category,
        e.role_description,
        e.attainability_type,
        e.attainability_source,
        e.attainability_evidence,
        e.is_verified,
        e.badge,
        m.total_users,
        m.active_users,
        ROUND(m.active_users * 100.0 / t.total_active_users, 2) as active_percentage,
        ROUND(m.avg_quality_score, 2) as avg_quality_score,
        CURRENT_TIMESTAMP() as last_updated
      FROM weighted_metrics m
      CROSS JOIN total_active t
      FULL OUTER JOIN existing_data e ON e.role_name = m.role_name
      ORDER BY role_name
    `;

    // Create new table
    console.log('Creating new glossary table...');
    const [createJob] = await client.createQueryJob({
      query: createNewTableQuery,
      location: 'US'
    });
    await createJob.getQueryResults();

    // Verify new table has no duplicates
    console.log('Checking new table for duplicates...');
    const checkNewTableQuery = `
      SELECT role_name, COUNT(*) as count
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_new\`
      GROUP BY role_name
      HAVING count > 1
    `;
    const [checkJob] = await client.createQueryJob({
      query: checkNewTableQuery,
      location: 'US'
    });
    const [checkResults] = await checkJob.getQueryResults();
    if (checkResults.length > 0) {
      console.error('Found duplicates in new table:', checkResults);
      throw new Error('Duplicate entries found in new table');
    }

    // Swap the tables using individual commands
    console.log('Swapping tables...');
    const swapQueries = [
      // First backup the current table
      `CREATE OR REPLACE TABLE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_old\` AS
       SELECT * FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\``,
      
      // Then replace the current table with the new one
      `CREATE OR REPLACE TABLE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` AS
       SELECT * FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_new\``,
      
      // Finally clean up the new table
      `DROP TABLE IF EXISTS \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_new\``
    ];

    for (const query of swapQueries) {
      const [job] = await client.createQueryJob({
        query,
        location: 'US'
      });
      await job.getQueryResults();
    }

    // Count rows in new table
    const countQuery = `
      SELECT COUNT(*) as count
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\`
    `;
    const [countJob] = await client.createQueryJob({
      query: countQuery,
      location: 'US'
    });
    const [countResults] = await countJob.getQueryResults();

    return { 
      success: true, 
      message: "Quality scores updated successfully",
      userScoresUpdated: userResults.length,
      totalRoles: countResults[0].count
    };
  } catch (error: any) {
    console.error("Error updating quality scores:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });

    // Clean up in case of error
    try {
      const cleanupQueries = [
        `DROP TABLE IF EXISTS \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_new\``,
        `DROP TABLE IF EXISTS \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary_old\``
      ];
      for (const query of cleanupQueries) {
        const [job] = await client.createQueryJob({
          query,
          location: 'US'
        });
        await job.getQueryResults();
      }
    } catch (cleanupError) {
      console.error("Error cleaning up tables:", cleanupError);
    }

    return { 
      success: false, 
      error: error.message || "Unknown error",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Scheduled function that runs every 2 hours to update quality scores
 */
export const scheduledQualityScoresUpdateV2 = onSchedule({
  schedule: "0 */2 * * *",  // Run every 2 hours
  timeZone: "UTC",
  memory: "256MiB",
  maxInstances: 1,
  region: "us-central1"
}, async (event) => {
  console.log('Starting scheduled quality scores update');
  await updateQualityScores();
});

/**
 * HTTP function that can be called to manually update quality scores
 */
export const manualQualityScoresUpdateV2 = onRequest({
  memory: "256MiB",
  maxInstances: 1,
  cors: true,
  region: "us-central1",
  invoker: "public"
}, async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    console.log('Starting manual quality scores update');
    const result = await updateQualityScores();
    res.json(result);
  } catch (error) {
    console.error('Error in manual quality scores update:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name
      } : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}); 