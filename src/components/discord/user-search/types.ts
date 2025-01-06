export interface DiscordRole {
  id: string;
  name: string;
}

export interface DiscordUser {
  author_id: string;
  author_name: string;
  author_avatar_url: string;
  roles: DiscordRole[];
  last_active: string;
  last_message_id: string;
  searchTokens: string[];
  updated_at: number;
} 