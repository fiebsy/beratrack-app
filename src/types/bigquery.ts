export interface BigQueryMessage {
  message_id: string;
  channel_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  author_roles: Array<{
    id: string;
    name: string;
  }>;
  content: string;
  timestamp: string;
  reaction_count: number | null;
  thread_id: string | null;
  reply_count: number | null;
  attachment_urls: string[];
  processed_at: string;
}

export interface BigQueryMessageBatch {
  messages: BigQueryMessage[];
  stats: {
    total_messages: number;
    unique_authors: number;
    total_reactions: number;
    total_replies: number;
    processed_at: string;
  };
} 
