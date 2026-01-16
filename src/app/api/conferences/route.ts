import { NextResponse } from 'next/server';
import conferenceData from '../../../../public/data/conferences.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const cfpOnly = searchParams.get('cfpOpen') === 'true';
    const financialAidOnly = searchParams.get('financialAid') === 'true';

    // Type assertion for the imported data
    const data = conferenceData as {
      conferences: Array<{
        domain: string;
        cfp?: { isOpen: boolean } | null;
        financialAid?: { available: boolean };
        [key: string]: unknown;
      }>;
      domains: Array<{ slug: string;[key: string]: unknown }>;
      stats: { [key: string]: unknown };
      lastUpdated: string | null;
      source: string;
      version: string;
    };

    let conferences = [...data.conferences];

    // Filter by domain
    if (domain && domain !== 'all') {
      conferences = conferences.filter(c => c.domain === domain);
    }

    // Filter by CFP status
    if (cfpOnly) {
      conferences = conferences.filter(c => c.cfp?.isOpen);
    }

    // Filter by financial aid
    if (financialAidOnly) {
      conferences = conferences.filter(c => c.financialAid?.available);
    }

    return NextResponse.json({
      lastUpdated: data.lastUpdated,
      source: data.source,
      version: data.version,
      stats: data.stats,
      domains: data.domains,
      conferences,
    });
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conferences' },
      { status: 500 }
    );
  }
}