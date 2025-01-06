import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

export async function GET() {
  try {
    // Initialize BigQuery with current credentials
    const bigquery = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'pickaxe-dashboard',
      ...(process.env.VERCEL
        ? {
            credentials: {
              client_email: process.env.GOOGLE_CLIENT_EMAIL,
              private_key: process.env.GOOGLE_PRIVATE_KEY,
            }
          }
        : {
            keyFilename: './service-account.json'
          }),
      location: 'US'
    });

    // Test query
    const query = `
      SELECT 
        CURRENT_TIMESTAMP() as timestamp,
        'Credentials working!' as message
    `;

    const [rows] = await bigquery.query({ query });

    return NextResponse.json({
      success: true,
      environment: process.env.VERCEL ? 'vercel' : 'local',
      data: rows[0],
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      serviceAccount: process.env.GOOGLE_CLIENT_EMAIL,
    });
  } catch (error) {
    console.error('Credentials Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        environment: process.env.VERCEL ? 'vercel' : 'local',
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        serviceAccount: process.env.GOOGLE_CLIENT_EMAIL,
      },
      { status: 500 }
    );
  }
} 