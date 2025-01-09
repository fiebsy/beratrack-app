"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualRoleChangeTrackerUpdateV2 = exports.scheduledRoleChangeTrackerUpdateV2 = exports.updateRoleChangeTracker = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const bigquery_1 = require("@google-cloud/bigquery");
/**
 * Updates the role change tracker table to monitor role transitions
 * Runs every 2 hours to track:
 * - Role replacements (e.g., when one role is being phased out for another)
 * - Removal of deprecated roles
 * - Introduction of new roles
 * - Roles missing from the glossary
 */
async function updateRoleChangeTracker() {
    const client = new bigquery_1.BigQuery();
    console.log('Starting role change tracker update...');
    try {
        // Create or replace the change tracker table
        const query = `
      CREATE OR REPLACE TABLE \`pickaxe-dashboard.discord_berachain_roles.role_change_tracker\` AS
      WITH consistently_active_users AS (
        SELECT DISTINCT m1.author_id 
        FROM \`pickaxe-dashboard.discord_berachain.messages\` m1 
        WHERE m1.timestamp BETWEEN 
          TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 DAY) 
          AND TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY) 
        AND EXISTS (
          SELECT 1 
          FROM \`pickaxe-dashboard.discord_berachain.messages\` m2 
          WHERE m2.author_id = m1.author_id 
          AND m2.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        )
      ),
      roles_14days_ago AS (
        SELECT m.author_id, 
               ARRAY_AGG(DISTINCT role.name) as old_roles 
        FROM \`pickaxe-dashboard.discord_berachain.messages\` m, 
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
        FROM \`pickaxe-dashboard.discord_berachain.messages\` m, 
        UNNEST(m.author_roles) as role 
        WHERE m.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) 
        AND m.author_id IN (SELECT author_id FROM consistently_active_users) 
        GROUP BY author_id
      ),
      role_changes AS (
        SELECT r14.author_id, r14.old_roles, r7.recent_roles 
        FROM roles_14days_ago r14 
        JOIN roles_last_7days r7 ON r14.author_id = r7.author_id
      ),
      role_stats AS (
        SELECT rc.author_id, 
               role_name, 
               MIN(m.timestamp) as first_seen_with_role,
               MAX(m.timestamp) as last_seen_with_role
        FROM role_changes rc
        JOIN \`pickaxe-dashboard.discord_berachain.messages\` m 
          ON rc.author_id = m.author_id
        CROSS JOIN UNNEST(recent_roles) as role_name 
        WHERE role_name NOT IN UNNEST(old_roles)
          AND role_name IN (SELECT DISTINCT name FROM UNNEST(m.author_roles) as role)
        GROUP BY rc.author_id, role_name
      ),
      additions AS (
        SELECT role_name, 
               COUNT(*) as times_added,
               MIN(first_seen_with_role) as first_addition,
               MAX(last_seen_with_role) as last_addition
        FROM role_stats 
        GROUP BY role_name
      ),
      role_removals AS (
        SELECT rc.author_id, 
               role_name, 
               MIN(m.timestamp) as first_seen_without_role,
               MAX(m.timestamp) as last_seen_without_role
        FROM role_changes rc
        JOIN \`pickaxe-dashboard.discord_berachain.messages\` m 
          ON rc.author_id = m.author_id
        CROSS JOIN UNNEST(old_roles) as role_name 
        WHERE role_name NOT IN UNNEST(recent_roles)
          AND role_name NOT IN (SELECT DISTINCT name FROM UNNEST(m.author_roles) as role)
        GROUP BY rc.author_id, role_name
      ),
      removals AS (
        SELECT role_name, 
               COUNT(*) as times_removed,
               MIN(first_seen_without_role) as first_removal,
               MAX(last_seen_without_role) as last_removal
        FROM role_removals 
        GROUP BY role_name
      )
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
        CURRENT_DATE() as snapshot_date
      FROM additions a 
      FULL OUTER JOIN removals r ON a.role_name = r.role_name
      LEFT JOIN \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` g 
        ON COALESCE(a.role_name, r.role_name) = g.role_name
      WHERE COALESCE(a.times_added, 0) + COALESCE(r.times_removed, 0) > 0
    `;
        // Execute the query
        console.log('Creating/updating role change tracker table...');
        const [job] = await client.createQueryJob({
            query,
            location: 'US',
            maximumBytesBilled: "1000000000"
        });
        // Wait for the job to complete
        await job.getQueryResults();
        // Get stats about the update
        const statsQuery = `
      SELECT 
        COUNT(*) as total_roles,
        COUNTIF(additions > 0) as roles_with_additions,
        COUNTIF(removals > 0) as roles_with_removals,
        COUNTIF(NOT in_glossary) as roles_missing_from_glossary
      FROM \`pickaxe-dashboard.discord_berachain_roles.role_change_tracker\`
    `;
        const [statsJob] = await client.createQueryJob({
            query: statsQuery,
            location: 'US'
        });
        const [stats] = await statsJob.getQueryResults();
        return {
            success: true,
            message: "Role change tracker updated successfully",
            stats: stats[0],
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error("Error updating role change tracker:", {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            timestamp: new Date().toISOString()
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}
exports.updateRoleChangeTracker = updateRoleChangeTracker;
/**
 * Creates draft glossary entries for roles that don't exist in the glossary
 */
async function createDraftGlossaryEntries() {
    const client = new bigquery_1.BigQuery();
    console.log('Starting draft glossary entries creation...');
    try {
        // First create a temp table with the draft entries
        const createDraftsQuery = `
      CREATE OR REPLACE TABLE \`pickaxe-dashboard.discord_berachain_roles.glossary_drafts\` AS
      WITH role_ids AS (
        SELECT DISTINCT 
          CAST(role.id AS STRING) as role_id,
          role.name as role_name 
        FROM \`pickaxe-dashboard.discord_berachain.messages\`, 
        UNNEST(author_roles) as role 
        WHERE role.name IN (
          SELECT role_name 
          FROM \`pickaxe-dashboard.discord_berachain_roles.role_change_tracker\` 
          WHERE NOT in_glossary
        )
      ),
      new_roles AS (
        SELECT t.role_name, t.additions, t.removals, t.last_addition_date, r.role_id 
        FROM \`pickaxe-dashboard.discord_berachain_roles.role_change_tracker\` t 
        JOIN role_ids r ON t.role_name = r.role_name 
        WHERE NOT t.in_glossary
      )
      SELECT 
        role_name,
        role_id,
        "Unclear" as role_category,
        "Role purpose unclear or unknown" as role_description,
        "UNCLEAR" as attainability_type,
        "Unknown" as attainability_source,
        FORMAT("First seen %t", last_addition_date) as attainability_evidence,
        TRUE as is_verified,
        "UNCLEAR" as badge,
        additions as total_users,
        0 as active_users,
        0.0 as active_percentage,
        0.0 as avg_quality_score,
        CURRENT_TIMESTAMP() as last_updated
      FROM new_roles
    `;
        // Create the drafts
        console.log('Creating draft entries...');
        const [createJob] = await client.createQueryJob({
            query: createDraftsQuery,
            location: 'US'
        });
        await createJob.getQueryResults();
        // Now merge the drafts into the main glossary
        const mergeQuery = `
      MERGE \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` T
      USING (
        SELECT 
          role_name,
          role_id,
          role_category,
          role_description,
          attainability_type,
          attainability_source,
          attainability_evidence,
          CAST(TRUE as BOOL) as is_verified,
          "UNCLEAR" as badge,
          total_users,
          active_users,
          active_percentage,
          avg_quality_score,
          last_updated
        FROM \`pickaxe-dashboard.discord_berachain_roles.glossary_drafts\`
      ) S
      ON T.role_name = S.role_name
      WHEN MATCHED THEN
        UPDATE SET
          role_id = S.role_id,
          role_category = S.role_category,
          role_description = S.role_description,
          attainability_type = S.attainability_type,
          attainability_source = S.attainability_source,
          attainability_evidence = S.attainability_evidence,
          is_verified = S.is_verified,
          badge = S.badge,
          total_users = S.total_users,
          active_users = S.active_users,
          active_percentage = S.active_percentage,
          avg_quality_score = S.avg_quality_score,
          last_updated = S.last_updated
      WHEN NOT MATCHED THEN
        INSERT (
          role_name,
          role_id,
          role_category,
          role_description,
          attainability_type,
          attainability_source,
          attainability_evidence,
          is_verified,
          badge,
          total_users,
          active_users,
          active_percentage,
          avg_quality_score,
          last_updated
        )
        VALUES (
          S.role_name,
          S.role_id,
          S.role_category,
          S.role_description,
          S.attainability_type,
          S.attainability_source,
          S.attainability_evidence,
          S.is_verified,
          S.badge,
          S.total_users,
          S.active_users,
          S.active_percentage,
          S.avg_quality_score,
          S.last_updated
        )
    `;
        console.log('Merging drafts into glossary...');
        const [mergeJob] = await client.createQueryJob({
            query: mergeQuery,
            location: 'US'
        });
        await mergeJob.getQueryResults();
        // Get stats about what was added
        const statsQuery = `
      SELECT 
        COUNT(*) as roles_added,
        ARRAY_AGG(STRUCT(
          role_name,
          role_id,
          total_users,
          attainability_evidence
        )) as added_roles
      FROM \`pickaxe-dashboard.discord_berachain_roles.glossary_drafts\`
    `;
        const [statsJob] = await client.createQueryJob({
            query: statsQuery,
            location: 'US'
        });
        const [stats] = await statsJob.getQueryResults();
        return {
            success: true,
            message: "Draft glossary entries created and merged",
            stats: stats[0],
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error("Error creating draft glossary entries:", {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            timestamp: new Date().toISOString()
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}
/**
 * Updates the role change tracker and creates draft glossary entries
 */
async function updateRoleTracking() {
    // First update the change tracker
    const trackerResult = await updateRoleChangeTracker();
    // If successful and there are roles missing from glossary, create drafts
    if (trackerResult.success && trackerResult.stats.roles_missing_from_glossary > 0) {
        console.log(`Found ${trackerResult.stats.roles_missing_from_glossary} roles missing from glossary, creating drafts...`);
        const draftResult = await createDraftGlossaryEntries();
        return Object.assign(Object.assign({}, trackerResult), { draftEntries: draftResult });
    }
    return trackerResult;
}
/**
 * Scheduled function that runs every 2 hours to update the role change tracker
 */
exports.scheduledRoleChangeTrackerUpdateV2 = (0, scheduler_1.onSchedule)({
    schedule: "0 */2 * * *",
    timeZone: "UTC",
    memory: "256MiB",
    maxInstances: 1,
    region: "us-central1"
}, async (event) => {
    console.log('Starting scheduled role change tracker update');
    await updateRoleTracking();
});
/**
 * HTTP function that can be called to manually update the role change tracker
 */
exports.manualRoleChangeTrackerUpdateV2 = (0, https_1.onRequest)({
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
        console.log('Starting manual role change tracker update');
        const result = await updateRoleTracking();
        res.json(result);
    }
    catch (error) {
        console.error('Error in manual role change tracker update:', {
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
//# sourceMappingURL=change-tracker.js.map