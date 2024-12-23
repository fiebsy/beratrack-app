import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Define environment schema
const envSchema = z.object({
  // Discord Configuration
  DISCORD_TOKEN: z.string({
    required_error: 'DISCORD_TOKEN is required',
    invalid_type_error: 'DISCORD_TOKEN must be a string'
  }),
  GUILD_ID: z.string({
    required_error: 'GUILD_ID is required',
    invalid_type_error: 'GUILD_ID must be a string'
  }),
  DISCORD_EXPORTER_PATH: z.string({
    required_error: 'DISCORD_EXPORTER_PATH is required',
    invalid_type_error: 'DISCORD_EXPORTER_PATH must be a string'
  }).default(process.env.DISCORD_EXPORTER_PATH || './bin/dce'),

  // BigQuery Configuration
  GOOGLE_CLOUD_PROJECT: z.string({
    required_error: 'GOOGLE_CLOUD_PROJECT is required',
    invalid_type_error: 'GOOGLE_CLOUD_PROJECT must be a string'
  }),
  BIGQUERY_DATASET: z.string({
    required_error: 'BIGQUERY_DATASET is required',
    invalid_type_error: 'BIGQUERY_DATASET must be a string'
  }),
  BIGQUERY_TABLE: z.string({
    required_error: 'BIGQUERY_TABLE is required',
    invalid_type_error: 'BIGQUERY_TABLE must be a string'
  }),
  GOOGLE_APPLICATION_CREDENTIALS: z.string({
    required_error: 'GOOGLE_APPLICATION_CREDENTIALS is required',
    invalid_type_error: 'GOOGLE_APPLICATION_CREDENTIALS must be a string'
  }),

  // Application Configuration
  EXPORT_PATH: z.string().default('./data/exports'),
  ARCHIVE_PATH: z.string().default('./data/archive'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  EXTRACT_INTERVAL_MINUTES: z.coerce.number().default(60)
});

// Parse and validate environment variables
const env = envSchema.parse({
  // Discord Configuration
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.DISCORD_GUILD_ID || process.env.GUILD_ID,
  DISCORD_EXPORTER_PATH: process.env.DISCORD_EXPORTER_PATH,

  // BigQuery Configuration
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  BIGQUERY_DATASET: process.env.BIGQUERY_DATASET,
  BIGQUERY_TABLE: process.env.BIGQUERY_TABLE,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // Application Configuration
  EXPORT_PATH: process.env.EXPORT_PATH,
  ARCHIVE_PATH: process.env.ARCHIVE_PATH,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  EXTRACT_INTERVAL_MINUTES: process.env.EXTRACT_INTERVAL_MINUTES
});

export default env; 