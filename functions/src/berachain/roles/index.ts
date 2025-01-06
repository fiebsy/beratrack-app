import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';

// Initialize the admin SDK for the 'bera' database if not already initialized
const beraApp = admin.apps.length ? admin.app('bera') : admin.initializeApp({
  databaseURL: "https://pickaxe-dashboard-bera.firebaseio.com"
}, 'bera');

const bigquery = new BigQuery();

/**
 * Core function that updates the Discord roles data
 * This is the main logic that both the scheduled and HTTP functions will use
 */
async function updateDiscordRoles() {
  const startTime = Date.now();
  try {
    console.log('Starting BigQuery query execution...');
    const query = `
      SELECT 
        author_id,
        author_name,
        author_avatar_url,
        author_roles,
        message_id,
        timestamp
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_view\`
    `;

    // Test BigQuery connection
    console.log('Testing BigQuery connection...');
    try {
      const exists = await bigquery.dataset('discord_berachain_roles').exists();
      console.log('BigQuery dataset exists:', exists);
    } catch (bqError) {
      console.error('BigQuery connection error:', {
        error: bqError,
        stack: bqError instanceof Error ? bqError.stack : undefined
      });
      throw new Error('Failed to connect to BigQuery');
    }

    // Run the query with error handling
    console.log('Executing BigQuery query...');
    let rows;
    try {
      [rows] = await bigquery.query({ 
        query,
        location: 'US',
        maximumBytesBilled: "1000000000"
      });
      console.log('Query executed successfully, row count:', rows?.length);
    } catch (queryError) {
      console.error('BigQuery query error:', {
        error: queryError,
        stack: queryError instanceof Error ? queryError.stack : undefined
      });
      throw new Error(`Failed to execute BigQuery query: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
    }

    // Validate query results
    if (!rows) {
      console.error('No rows returned from query');
      throw new Error('No data returned from BigQuery');
    }

    if (!Array.isArray(rows)) {
      console.error('Query result is not an array:', typeof rows);
      throw new Error('Invalid query results format');
    }

    console.log('Query response:', {
      rowCount: rows.length,
      sampleRow: rows[0] ? JSON.stringify(rows[0], null, 2) : 'No rows'
    });

    // Process the results and update Firebase with chunking
    console.log('Processing results and updating Firebase...');
    const CHUNK_SIZE = 500; // Process in smaller chunks to avoid memory issues
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      console.log(`Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(rows.length / CHUNK_SIZE)}`);
      await processAndUpdateFirebase(chunk);
    }
    console.log('Firebase update completed successfully');

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return { 
      success: true, 
      message: 'Discord roles updated successfully', 
      count: rows.length,
      duration: `${duration.toFixed(2)} seconds`,
      sample: rows[0]
    };
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      bigqueryClient: !!bigquery,
      beraApp: !!beraApp,
      elapsedTime: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`
    };
    
    console.error('Detailed error in updateDiscordRoles:', errorDetails);
    throw error;
  }
}

/**
 * Helper function to process BigQuery results and update Firebase
 */
async function processAndUpdateFirebase(rows: any[]) {
  try {
    const db = beraApp.database();
    const updates: { [key: string]: any } = {};
    const currentTimestamp = Date.now();
    
    console.log(`Starting to process ${rows.length} rows...`);
    let processedCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.author_id || !row.author_name) {
          console.warn('Skipping invalid row:', JSON.stringify(row));
          errorCount++;
          continue;
        }

        // Create searchable tokens from author name
        const searchTokens = generateSearchTokens(row.author_name);
        
        // Parse roles
        let roles = row.author_roles;
        try {
          if (typeof roles === 'string') {
            roles = JSON.parse(roles);
          }
        } catch (e) {
          console.warn(`Failed to parse roles for ${row.author_name}:`, e);
          roles = [];
        }
        
        // Parse timestamp
        let lastActive;
        try {
          lastActive = new Date(row.timestamp).toISOString();
        } catch (e) {
          console.warn(`Failed to parse timestamp for ${row.author_name}:`, e);
          lastActive = new Date().toISOString();
        }
        
        updates[`discord_roles/${row.author_id}`] = {
          author_id: row.author_id,
          author_name: row.author_name,
          author_avatar_url: row.author_avatar_url || '',
          roles: Array.isArray(roles) ? roles : [],
          last_message_id: row.message_id || '',
          last_active: lastActive,
          searchTokens,
          updated_at: currentTimestamp
        };
        
        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`Processed ${processedCount}/${rows.length} rows...`);
        }
      } catch (rowError) {
        errorCount++;
        console.error('Error processing row:', {
          error: rowError,
          row: JSON.stringify(row)
        });
      }
    }
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid updates to process');
    }
    
    console.log('Update statistics:', {
      totalRows: rows.length,
      processedSuccessfully: processedCount,
      errors: errorCount,
      updatesCount: Object.keys(updates).length
    });

    // Perform the update
    try {
      await db.ref().update(updates);
      console.log('Firebase update successful');
    } catch (updateError) {
      console.error('Firebase update failed:', {
        error: updateError,
        updateSize: Object.keys(updates).length
      });
      throw updateError;
    }
  } catch (error) {
    console.error('Error in processAndUpdateFirebase:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Helper function to generate search tokens for a username
 * Now includes full word tokens and sliding window tokens
 */
function generateSearchTokens(username: string): string[] {
  const tokens = new Set<string>();
  const normalized = username.toLowerCase().trim();
  
  // 1. Add prefix tokens (original functionality)
  for (let i = 1; i <= normalized.length; i++) {
    tokens.add(normalized.substring(0, i));
  }
  
  // 2. Add word-based tokens for usernames with separators
  const words = normalized.split(/[._-\s]/);
  words.forEach(word => {
    if (word) {
      // Add each word
      tokens.add(word);
      
      // Add prefixes of each word
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    }
  });
  
  // 3. Add sliding window tokens for partial matches anywhere
  const minWindowSize = 3; // Only create tokens for 3 or more characters to avoid noise
  for (let windowSize = minWindowSize; windowSize <= normalized.length; windowSize++) {
    for (let i = 0; i <= normalized.length - windowSize; i++) {
      tokens.add(normalized.substring(i, i + windowSize));
    }
  }

  return Array.from(tokens);
}

/**
 * V2 Scheduled function that runs every 30 minutes to update Discord roles
 */
export const scheduledRolesUpdateV2 = onSchedule({
  schedule: "*/30 * * * *",
  timeZone: "UTC",
  memory: "256MiB",
  maxInstances: 1,
  region: "us-central1"
}, async (event) => {
  console.log('Starting scheduled Discord roles update');
  await updateDiscordRoles();
});

/**
 * V2 HTTP function that can be called to manually update Discord roles
 */
export const manualRolesUpdateV2 = onRequest({
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
    console.log('Starting manual Discord roles update');
    const result = await updateDiscordRoles();
    res.json(result);
  } catch (error) {
    console.error('Detailed error in manual roles update:', {
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

/**
 * Updates the active users statistics for all roles in the glossary
 */
async function updateRoleActivityStats() {
  const startTime = Date.now();
  try {
    console.log('Starting role activity stats update...');
    const query = `
      MERGE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` T 
      USING (
        WITH active_users AS (
          SELECT DISTINCT author_id 
          FROM \`pickaxe-dashboard.discord_berachain.messages\` 
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        ), 
        message_roles AS (
          SELECT DISTINCT m.author_id, role.name as role_name 
          FROM \`pickaxe-dashboard.discord_berachain.messages\` m, 
          UNNEST(m.author_roles) role 
          WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        )
        SELECT 
          r.role_name, 
          COUNT(DISTINCT mr.author_id) as active_users,
          ROUND(SAFE_DIVIDE(COUNT(DISTINCT mr.author_id) * 100, 
            (SELECT COUNT(DISTINCT author_id) FROM active_users)
          ), 2) as active_percentage
        FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` r 
        LEFT JOIN message_roles mr ON mr.role_name = r.role_name 
        GROUP BY r.role_name
      ) S 
      ON T.role_name = S.role_name
      WHEN MATCHED THEN UPDATE SET 
        active_users = S.active_users,
        active_percentage = S.active_percentage,
        last_updated = CURRENT_TIMESTAMP()
    `;

    // Run the query with error handling
    console.log('Executing BigQuery update...');
    try {
      const [job] = await bigquery.createQueryJob({
        query,
        location: 'US',
        maximumBytesBilled: "1000000000"
      });
      
      const [results] = await job.getQueryResults();
      console.log('Update completed successfully:', {
        rowsAffected: results.length,
        timestamp: new Date().toISOString()
      });
    } catch (queryError) {
      console.error('BigQuery query error:', {
        error: queryError,
        stack: queryError instanceof Error ? queryError.stack : undefined
      });
      throw new Error(`Failed to execute BigQuery query: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return {
      success: true,
      message: 'Role activity stats updated successfully',
      duration: `${duration.toFixed(2)} seconds`
    };
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      elapsedTime: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`
    };
    
    console.error('Error in updateRoleActivityStats:', errorDetails);
    throw error;
  }
}

/**
 * Scheduled function that runs every 120 minutes to update role activity stats
 */
export const scheduledRoleStatsUpdateV2 = onSchedule({
  schedule: "0 */2 * * *",  // Run every 2 hours (120 minutes)
  timeZone: "UTC",
  memory: "256MiB",
  maxInstances: 1,
  region: "us-central1"
}, async (event) => {
  console.log('Starting scheduled role activity stats update');
  await updateRoleActivityStats();
});

/**
 * HTTP function that can be called to manually update role activity stats
 */
export const manualRoleStatsUpdateV2 = onRequest({
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
    console.log('Starting manual role activity stats update');
    const result = await updateRoleActivityStats();
    res.json(result);
  } catch (error) {
    console.error('Error in manual role stats update:', {
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

/**
 * Calculates quality scores for all users and updates role-level metrics
 * 
 * Quality Score Components:
 * 1. Reactions (0-60 points): 12 points per reaction/msg, max 5 reactions
 * 2. Replies (0-30 points): 15 points per reply/msg, max 2 replies
 * 3. Threads (0-10 points): 50 points * thread ratio, max 20% threads
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
              -- Reactions component (60 points max)
              LEAST(reactions_per_msg * 12, 60) +
              -- Replies component (30 points max)
              LEAST(replies_per_msg * 15, 30) +
              -- Thread starter component (10 points max)
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
          COUNTIF(c.quality_score > 0) as active_users,
          ROUND(AVG(CASE WHEN c.quality_score > 0 THEN c.quality_score END), 2) as avg_quality_score,
          COUNT(CASE WHEN c.quality_score >= 20 THEN 1 END) as high_quality_count
        FROM latest_roles r
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
          avg_quality_score as base_quality_score,
          high_quality_count,
          -- Add size multiplier only for non-system roles
          CASE 
            WHEN badge NOT IN ('TEAM', 'SYSTEM') AND role_category NOT IN ('Bot', 'Moderator') THEN
              CASE 
                WHEN active_users < 5 THEN avg_quality_score * 0.5  -- Very small groups
                WHEN active_users < 20 THEN avg_quality_score * 0.8 -- Small groups
                WHEN active_users < 100 THEN avg_quality_score * 1.0 -- Medium groups
                WHEN active_users < 500 THEN avg_quality_score * 1.2 -- Large groups
                ELSE avg_quality_score * 1.5 -- Very large groups
              END
            ELSE avg_quality_score -- Keep original score for system roles
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
        m.avg_quality_score,
        m.high_quality_count,
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