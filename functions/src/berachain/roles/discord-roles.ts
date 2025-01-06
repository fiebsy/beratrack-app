import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';

// Initialize the admin SDK for the 'bera' database if not already initialized
const beraApp = admin.apps.length ? admin.app('bera') : admin.initializeApp({
  databaseURL: "https://pickaxe-dashboard-bera.firebaseio.com"
}, 'bera');

const bigquery = new BigQuery();

/**
 * Core function that updates the Discord roles data
 * This is the main logic that both the scheduled and HTTP functions will use
 */
async function updateDiscordRoles() {
  const startTime = Date.now();
  try {
    console.log('Starting BigQuery query execution...');
    const query = `
      SELECT 
        author_id,
        author_name,
        author_avatar_url,
        author_roles,
        message_id,
        timestamp
      FROM \`pickaxe-dashboard.discord_berachain_roles.discord_roles_view\`
    `;

    // Test BigQuery connection
    console.log('Testing BigQuery connection...');
    try {
      const exists = await bigquery.dataset('discord_berachain_roles').exists();
      console.log('BigQuery dataset exists:', exists);
    } catch (bqError) {
      console.error('BigQuery connection error:', {
        error: bqError,
        stack: bqError instanceof Error ? bqError.stack : undefined
      });
      throw new Error('Failed to connect to BigQuery');
    }

    // Run the query with error handling
    console.log('Executing BigQuery query...');
    let rows;
    try {
      [rows] = await bigquery.query({ 
        query,
        location: 'US',
        maximumBytesBilled: "1000000000"
      });
      console.log('Query executed successfully, row count:', rows?.length);
    } catch (queryError) {
      console.error('BigQuery query error:', {
        error: queryError,
        stack: queryError instanceof Error ? queryError.stack : undefined
      });
      throw new Error(`Failed to execute BigQuery query: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
    }

    // Validate query results
    if (!rows) {
      console.error('No rows returned from query');
      throw new Error('No data returned from BigQuery');
    }

    if (!Array.isArray(rows)) {
      console.error('Query result is not an array:', typeof rows);
      throw new Error('Invalid query results format');
    }

    console.log('Query response:', {
      rowCount: rows.length,
      sampleRow: rows[0] ? JSON.stringify(rows[0], null, 2) : 'No rows'
    });

    // Process the results and update Firebase with chunking
    console.log('Processing results and updating Firebase...');
    const CHUNK_SIZE = 500; // Process in smaller chunks to avoid memory issues
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      console.log(`Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(rows.length / CHUNK_SIZE)}`);
      await processAndUpdateFirebase(chunk);
    }
    console.log('Firebase update completed successfully');

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    return { 
      success: true, 
      message: 'Discord roles updated successfully', 
      count: rows.length,
      duration: `${duration.toFixed(2)} seconds`,
      sample: rows[0]
    };
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      bigqueryClient: !!bigquery,
      beraApp: !!beraApp,
      elapsedTime: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`
    };
    
    console.error('Detailed error in updateDiscordRoles:', errorDetails);
    throw error;
  }
}

/**
 * Helper function to process BigQuery results and update Firebase
 */
async function processAndUpdateFirebase(rows: any[]) {
  try {
    const db = beraApp.database();
    const updates: { [key: string]: any } = {};
    const currentTimestamp = Date.now();
    
    console.log(`Starting to process ${rows.length} rows...`);
    let processedCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.author_id || !row.author_name) {
          console.warn('Skipping invalid row:', JSON.stringify(row));
          errorCount++;
          continue;
        }

        // Create searchable tokens from author name
        const searchTokens = generateSearchTokens(row.author_name);
        
        // Parse roles
        let roles = row.author_roles;
        try {
          if (typeof roles === 'string') {
            roles = JSON.parse(roles);
          }
        } catch (e) {
          console.warn(`Failed to parse roles for ${row.author_name}:`, e);
          roles = [];
        }
        
        // Parse timestamp
        let lastActive;
        try {
          lastActive = new Date(row.timestamp).toISOString();
        } catch (e) {
          console.warn(`Failed to parse timestamp for ${row.author_name}:`, e);
          lastActive = new Date().toISOString();
        }
        
        updates[`discord_roles/${row.author_id}`] = {
          author_id: row.author_id,
          author_name: row.author_name,
          author_avatar_url: row.author_avatar_url || '',
          roles: Array.isArray(roles) ? roles : [],
          last_message_id: row.message_id || '',
          last_active: lastActive,
          searchTokens,
          updated_at: currentTimestamp
        };
        
        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`Processed ${processedCount}/${rows.length} rows...`);
        }
      } catch (rowError) {
        errorCount++;
        console.error('Error processing row:', {
          error: rowError,
          row: JSON.stringify(row)
        });
      }
    }
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid updates to process');
    }
    
    console.log('Update statistics:', {
      totalRows: rows.length,
      processedSuccessfully: processedCount,
      errors: errorCount,
      updatesCount: Object.keys(updates).length
    });

    // Perform the update
    try {
      await db.ref().update(updates);
      console.log('Firebase update successful');
    } catch (updateError) {
      console.error('Firebase update failed:', {
        error: updateError,
        updateSize: Object.keys(updates).length
      });
      throw updateError;
    }
  } catch (error) {
    console.error('Error in processAndUpdateFirebase:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Helper function to generate search tokens for a username
 */
function generateSearchTokens(username: string): string[] {
  const tokens = new Set<string>();
  const normalized = username.toLowerCase().trim();
  
  // 1. Add prefix tokens (original functionality)
  for (let i = 1; i <= normalized.length; i++) {
    tokens.add(normalized.substring(0, i));
  }
  
  // 2. Add word-based tokens for usernames with separators
  const words = normalized.split(/[._-\s]/);
  words.forEach(word => {
    if (word) {
      // Add each word
      tokens.add(word);
      
      // Add prefixes of each word
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    }
  });
  
  // 3. Add sliding window tokens for partial matches anywhere
  const minWindowSize = 3; // Only create tokens for 3 or more characters to avoid noise
  for (let windowSize = minWindowSize; windowSize <= normalized.length; windowSize++) {
    for (let i = 0; i <= normalized.length - windowSize; i++) {
      tokens.add(normalized.substring(i, i + windowSize));
    }
  }

  return Array.from(tokens);
}

/**
 * V2 Scheduled function that runs every 30 minutes to update Discord roles
 */
export const scheduledRolesUpdateV2 = onSchedule({
  schedule: "*/30 * * * *",
  timeZone: "UTC",
  memory: "256MiB",
  maxInstances: 1,
  region: "us-central1"
}, async (event) => {
  console.log('Starting scheduled Discord roles update');
  await updateDiscordRoles();
});

/**
 * V2 HTTP function that can be called to manually update Discord roles
 */
export const manualRolesUpdateV2 = onRequest({
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
    console.log('Starting manual Discord roles update');
    const result = await updateDiscordRoles();
    res.json(result);
  } catch (error) {
    console.error('Detailed error in manual roles update:', {
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