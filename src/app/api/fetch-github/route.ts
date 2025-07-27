import { NextResponse } from 'next/server';
import { 
  getConferencesForDomain,
  getAvailableDomains,
  getCurrentYear 
} from '@/lib/conferences';
import { 
  upsertConferences, 
  createScrapeLog, 
  updateScrapeLog
} from '@/lib/database';

export async function POST() {
  const startTime = new Date();
  let scrapeLogId: number | null = null;

  try {
    // Create initial scrape log
    const initialLog = await createScrapeLog({
      scrapeType: 'github',
      status: 'success',
      conferencesFound: 0,
      conferencesAdded: 0,
      conferencesUpdated: 0,
      startedAt: startTime.toISOString()
    });
    scrapeLogId = initialLog.id!;

    console.log('Starting GitHub data fetch...');

    const year = await getCurrentYear();
    const domains = await getAvailableDomains(year);
    let totalConferences = 0;
    let totalAdded = 0;
    let totalUpdated = 0;

    console.log(`Found ${domains.length} domains for year ${year}:`, domains);

    // Fetch and store GitHub conferences for each domain
    for (const domainSlug of domains) {
      try {
        console.log(`Fetching conferences for domain: ${domainSlug}`);
        const conferences = await getConferencesForDomain(domainSlug, year);
        totalConferences += conferences.length;

        console.log(`Found ${conferences.length} conferences for ${domainSlug}`);
        
        // Debug: Log first conference structure
        if (conferences.length > 0) {
          console.log('Sample conference structure:', JSON.stringify(conferences[0], null, 2));
        }

        if (conferences.length > 0) {
          try {
            const { added, updated } = await upsertConferences(conferences, domainSlug);
            totalAdded += added;
            totalUpdated += updated;
            console.log(`Domain ${domainSlug}: ${added} added, ${updated} updated`);
          } catch (upsertError) {
            console.error(`Error upserting conferences for ${domainSlug}:`, upsertError);
          }
        }
      } catch (error) {
        console.error(`Error processing GitHub data for domain ${domainSlug}:`, error);
      }
    }

    // Update scrape log
    await updateScrapeLog(scrapeLogId, {
      status: 'success',
      conferencesFound: totalConferences,
      conferencesAdded: totalAdded,
      conferencesUpdated: totalUpdated,
      completedAt: new Date().toISOString()
    });

    console.log(`GitHub fetch completed: ${totalAdded} added, ${totalUpdated} updated`);

    return NextResponse.json({
      success: true,
      data: {
        totalConferences,
        totalAdded,
        totalUpdated,
        domains: domains.length,
        processingTime: Date.now() - startTime.getTime()
      }
    });

  } catch (error) {
    console.error('Error in GitHub fetch:', error);
    
    if (scrapeLogId) {
      await updateScrapeLog(scrapeLogId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch GitHub data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const year = await getCurrentYear();
    const domains = await getAvailableDomains(year);
    
    return NextResponse.json({
      success: true,
      data: {
        availableDomains: domains,
        currentYear: year
      }
    });
  } catch (error) {
    console.error('Error fetching available domains:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch available domains'
      },
      { status: 500 }
    );
  }
} 