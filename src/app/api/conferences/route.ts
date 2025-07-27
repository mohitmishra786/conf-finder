import { NextResponse } from 'next/server';
import { getAllDomainsWithConferences } from '@/lib/database';

export async function GET() {
  try {
    const domains = await getAllDomainsWithConferences();
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conferences' },
      { status: 500 }
    );
  }
} 