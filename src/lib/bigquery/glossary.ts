import { BigQuery } from '@google-cloud/bigquery';
import type { GlossaryRole } from '@/components/glossary/types';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'pickaxe-dashboard',
  ...(process.env.VERCEL
    ? {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }
      }
    : {
        keyFilename: './service-account.json'
      }),
  location: 'US'
});

export async function getGlossaryData(): Promise<GlossaryRole[]> {
  const query = `
    WITH discord_active_totals AS (
      SELECT 
        COUNT(*) as total_discord_users,
        COUNTIF(quality_score > 0) as total_active_users
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_current\`
    ),
    role_metrics AS (
      SELECT
        g.role_id,
        g.role_name,
        g.role_category,
        g.role_description,
        g.badge,
        g.attainability_type,
        g.attainability_source,
        g.attainability_evidence,
        g.active_users,
        g.total_users as role_total_users,
        (SELECT total_discord_users FROM discord_active_totals) as total_discord_users,
        (SELECT total_active_users FROM discord_active_totals) as total_active_users,
        g.active_percentage,
        COALESCE(ROUND(g.avg_quality_score, 2), 0) as avg_quality_score,
        CAST(g.last_updated AS STRING) as last_updated,
        g.is_verified,
        -- Include role change tracking data
        COALESCE(t.additions, 0) as additions,
        COALESCE(t.removals, 0) as removals,
        CAST(t.last_addition_date AS STRING) as last_addition_date,
        CAST(t.last_removal_date AS STRING) as last_removal_date
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_glossary\` g
      LEFT JOIN \`pickaxe-dashboard.discord_berachain_roles.role_change_tracker\` t
        ON g.role_name = t.role_name
    ),
    ranked_roles AS (
      SELECT 
        *,
        -- Calculate rank for all roles based on quality score
        RANK() OVER (ORDER BY avg_quality_score DESC) as quality_rank,
        -- Count total roles
        COUNT(*) OVER () as total_roles
      FROM role_metrics
      WHERE is_verified = TRUE
    )
    SELECT * FROM ranked_roles
    ORDER BY avg_quality_score DESC
  `;

  try {
    const [rows] = await bigquery.query({ query });
    
    // Transform the BigQuery response into plain objects
    return rows.map(row => ({
      role_id: String(row.role_id),
      role_name: String(row.role_name),
      role_category: String(row.role_category),
      role_description: String(row.role_description),
      badge: String(row.badge) as GlossaryRole['badge'],
      attainability_type: String(row.attainability_type),
      attainability_source: String(row.attainability_source),
      attainability_evidence: String(row.attainability_evidence),
      active_users: Number(row.active_users),
      total_users: Number(row.total_discord_users),
      total_active_users: Number(row.total_active_users),
      role_total_users: Number(row.role_total_users),
      active_percentage: Number(row.active_percentage),
      avg_quality_score: Number(row.avg_quality_score),
      last_updated: String(row.last_updated),
      is_verified: Boolean(row.is_verified),
      quality_rank: Number(row.quality_rank),
      total_roles: Number(row.total_roles),
      // Include role change tracking data
      additions: Number(row.additions),
      removals: Number(row.removals),
      last_addition_date: row.last_addition_date ? String(row.last_addition_date) : undefined,
      last_removal_date: row.last_removal_date ? String(row.last_removal_date) : undefined
    }));
  } catch (error) {
    console.error('Error fetching glossary data:', error);
    throw error;
  }
} 