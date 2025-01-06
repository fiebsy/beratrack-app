export interface DiscordGuild {
  id: string;
  name: string;
  iconUrl?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  type?: string;
  category?: string;
}

export interface DiscordChannel {
  id: string;
  type: string;
  categoryId: string | null;
  category: string | null;
  name: string;
  topic: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface DiscordAuthor {
  id: string;
  name: string;
  discriminator: string;
  nickname: string | null;
  color: string;
  isBot: boolean;
  roles: DiscordRole[];
  avatarUrl: string;
}

export interface DiscordAttachment {
  id: string;
  url: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: string;
}

export interface DiscordReaction {
  emoji: {
    id: string | null;
    name: string;
    isAnimated: boolean;
    imageUrl: string;
  };
  count: number;
}

export interface DiscordMessageReference {
  messageId: string;
  channelId: string;
  guildId: string;
}

export interface DiscordSticker {
  id: string;
  name: string;
  formatType: number;
  description: string | null;
  asset: string;
  packId?: string;
  tags?: string[];
}

export interface DiscordMessage {
  id: string;
  type: string;
  timestamp: string;
  timestampEdited: string | null;
  callEndedTimestamp: string | null;
  isPinned: boolean;
  content?: string;
  author?: DiscordAuthor;
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions: DiscordReaction[];
  mentions: DiscordAuthor[];
  reference?: DiscordMessageReference;
  stickers: DiscordSticker[];
}

export interface DiscordExport {
  guild: DiscordGuild;
  channel: DiscordChannel;
  dateRange: {
    after: string | null;
    before: string | null;
  };
  exportedAt: string;
  messages: DiscordMessage[];
} 