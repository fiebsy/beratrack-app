import { NextResponse } from 'next/server';
import { getTopChannelStats } from '@/lib/bigquery/client';

export async function GET() {
  try {
    const stats = await getTopChannelStats(7);
    return NextResponse.json({ success: true, data: stats });
  } catch (error: Error | unknown) {
    console.error('BigQuery Test Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
} 