export interface GlossaryRole {
  role_id: string;
  role_name: string;
  role_category: string;
  role_description: string;
  attainability_type: string;
  attainability_source: string;
  attainability_evidence: string;
  total_users: number;
  active_users: number;
  active_percentage: number;
  avg_quality_score: number;
  total_active_users: number;
  badge: "TEAM" | "NFT" | "COMMUNITY" | "SERVICE" | "SYSTEM" | "UNCLEAR";
  last_updated: string;
  quality_rank?: number;
  total_roles?: number;
}

export interface GlossaryTableProps {
  data: GlossaryRole[];
} 