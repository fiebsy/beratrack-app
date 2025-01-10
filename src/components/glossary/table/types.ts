export interface GlossaryRole {
  role_id: string;
  role_name: string;
  role_description: string;
  badge: "NFT" | "COMMUNITY" | "SERVICE" | "SYSTEM" | "TEAM" | "UNCLEAR";
  role_category: string;
  attainability_type: "OPEN" | "CLOSED" | "RESTRICTED" | "UNCLEAR";
  active_users: number;
  total_active_users: number;
  avg_quality_score: number;
  quality_rank: number;
  total_roles: number;
  last_updated: string;
  additions?: number;
  removals?: number;
} 