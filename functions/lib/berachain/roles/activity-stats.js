"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualRoleStatsUpdateV2 = exports.scheduledRoleStatsUpdateV2 = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const bigquery_1 = require("@google-cloud/bigquery");
const bigquery = new bigquery_1.BigQuery();
/**
 * Updates the active users statistics for all roles in the glossary
 * The active_percentage is calculated as:
 * (active users with role / total users with at least one message in 30 days) * 100
 */
async function updateRoleActivityStats() {
    const startTime = Date.now();
    try {
        console.log('Starting role activity stats update...');
        const query = `
      MERGE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` T 
      USING (
        WITH discord_active_totals AS (
          SELECT 
            COUNT(*) as total_active_users
          FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_current\`
          WHERE quality_score > 0
        ),
        active_users AS (
          SELECT DISTINCT 
            author_id,
            r.name as role_name
          FROM \`pickaxe-dashboard.discord_berachain.messages\` m,
          UNNEST(m.author_roles) r
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        ),
        role_metrics AS (
          SELECT 
            a.role_name,
            COUNT(DISTINCT a.author_id) as total_users,
            COUNTIF(c.quality_score > 0) as active_users
          FROM active_users a
          LEFT JOIN \`pickaxe-dashboard.discord_berachain_roles.discord_roles_current\` c
            ON a.author_id = c.author_id
          GROUP BY role_name
        )
        SELECT 
          r.role_name,
          r.total_users,
          r.active_users,
          ROUND(SAFE_DIVIDE(r.active_users * 100, d.total_active_users), 2) as active_percentage
        FROM role_metrics r
        CROSS JOIN discord_active_totals d
      ) S 
      ON T.role_name = S.role_name
      WHEN MATCHED THEN UPDATE SET 
        total_users = S.total_users,
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
        }
        catch (queryError) {
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
    }
    catch (error) {
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
exports.scheduledRoleStatsUpdateV2 = (0, scheduler_1.onSchedule)({
    schedule: "0 */2 * * *",
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
exports.manualRoleStatsUpdateV2 = (0, https_1.onRequest)({
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
    }
    catch (error) {
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
//# sourceMappingURL=activity-stats.js.map