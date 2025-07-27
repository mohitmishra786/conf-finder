import { NextResponse } from 'next/server';
import { getAllConferences } from '@/lib/conferences';

export async function GET() {
  try {
    const domains = await getAllConferences();
    
    return NextResponse.json({
      success: true,
      data: domains,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conferences',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 