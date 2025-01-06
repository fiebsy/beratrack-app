import { z } from 'zod';

const envSchema = z.object({
  // Discord Configuration
  DISCORD_TOKEN: z.string({
    required_error: 'DISCORD_TOKEN is required',
    invalid_type_error: 'DISCORD_TOKEN must be a string'
  }),
  DISCORD_GUILD_ID: z.string({
    required_error: 'DISCORD_GUILD_ID is required',
    invalid_type_error: 'DISCORD_GUILD_ID must be a string'
  }),

  // BigQuery Configuration
  GOOGLE_CLOUD_PROJECT: z.string({
    required_error: 'GOOGLE_CLOUD_PROJECT is required',
    invalid_type_error: 'GOOGLE_CLOUD_PROJECT must be a string'
  }),
  GOOGLE_CLIENT_EMAIL: z.string({
    required_error: 'GOOGLE_CLIENT_EMAIL is required',
    invalid_type_error: 'GOOGLE_CLIENT_EMAIL must be a string'
  }),
  GOOGLE_PRIVATE_KEY: z.string({
    required_error: 'GOOGLE_PRIVATE_KEY is required',
    invalid_type_error: 'GOOGLE_PRIVATE_KEY must be a string'
  }),
  BIGQUERY_DATASET: z.string({
    required_error: 'BIGQUERY_DATASET is required',
    invalid_type_error: 'BIGQUERY_DATASET must be a string'
  }),
  BIGQUERY_TABLE: z.string({
    required_error: 'BIGQUERY_TABLE is required',
    invalid_type_error: 'BIGQUERY_TABLE must be a string'
  }),

  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']),
  EXTRACT_INTERVAL_MINUTES: z.string().transform(Number),
  LOG_LEVEL: z.string(),

  // Data Paths
  EXPORT_PATH: z.string(),
  ARCHIVE_PATH: z.string(),
});

export const env = envSchema.parse({
  // Discord Configuration
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,

  // BigQuery Configuration
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  BIGQUERY_DATASET: process.env.BIGQUERY_DATASET,
  BIGQUERY_TABLE: process.env.BIGQUERY_TABLE,

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  EXTRACT_INTERVAL_MINUTES: process.env.EXTRACT_INTERVAL_MINUTES || '10',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Data Paths
  EXPORT_PATH: process.env.EXPORT_PATH || './data/exports',
  ARCHIVE_PATH: process.env.ARCHIVE_PATH || './data/archive',
}); 