export interface AttachmentRecord {
  message_id: string;
  channel_id: string;
  discord_url: string;
  filename: string;
  message_timestamp: Date;
  processed_at: { value: string } | string;
}

export interface AttachmentStats {
  total_pending: number;
  failed: number;
  oldest_pending: string;
  new_messages: number;
} 