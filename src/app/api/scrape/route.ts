import { NextResponse } from 'next/server';
import { ApifyScraper } from '@/lib/apify';
import { FireCrawlScraper } from '@/lib/firecrawl';
import {
  getAllDomainsWithConferences,
  upsertConferences,
  createScrapeLog,
  updateScrapeLog
} from '@/lib/database';
import { Conference } from '@/types/conference';

export async function POST() {
  const startTime = new Date();
  let scrapeLogId: number | undefined;

  try {
    // Create initial scrape log
    const initialLog = await createScrapeLog({
      scrapeType: 'apify',
      status: 'partial',
      conferencesFound: 0,
      conferencesAdded: 0,
      conferencesUpdated: 0,
      startedAt: startTime.toISOString(),
      completedAt: undefined,
      metadata: {}
    });
    scrapeLogId = initialLog.id!;

    console.log('Starting scraping process...');

    // Step 1: Fetch GitHub conferences with retry logic
    console.log('Starting GitHub scraping...');
    const maxRetries = 3;
    let totalGitHubAdded = 0;
    let totalGitHubUpdated = 0;
    let domains: { slug: string; conferences: Conference[] }[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`GitHub scraping attempt ${attempt}/${maxRetries}...`);
        domains = await getAllDomainsWithConferences();

        for (const domain of domains) {
          try {
            if (domain.conferences.length > 0) {
              const { added, updated } = await upsertConferences(domain.conferences, domain.slug);
              totalGitHubAdded += added;
              totalGitHubUpdated += updated;
            }
          } catch (error) {
            console.error(`Error storing GitHub conferences for domain ${domain.slug}:`, error);
          }
        }

        console.log(`GitHub scraping completed successfully on attempt ${attempt}`);
        break; // Success, exit retry loop

      } catch (error) {
        console.error(`GitHub scraping attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('GitHub scraping failed after all retries');
        }
      }
    }

    console.log(`GitHub scraping completed: ${totalGitHubAdded} added, ${totalGitHubUpdated} updated`);

    // Step 2: Run FireCrawl scraping
    console.log('Starting FireCrawl scraping...');
    const firecrawlScraper = new FireCrawlScraper();
    const firecrawlResults = await firecrawlScraper.scrapeAllDomains();

    let totalFirecrawlAdded = 0;
    let totalFirecrawlUpdated = 0;

    for (const [domainSlug, conferences] of firecrawlResults) {
      try {
        if (conferences.length > 0) {
          console.log(`Processing ${conferences.length} FireCrawl conferences for domain ${domainSlug}...`);
          const { added, updated } = await upsertConferences(conferences, domainSlug);
          totalFirecrawlAdded += added;
          totalFirecrawlUpdated += updated;
        }
      } catch (error) {
        console.error(`Error storing FireCrawl conferences for domain ${domainSlug}:`, error);
      }
    }

    console.log(`FireCrawl scraping completed: ${totalFirecrawlAdded} added, ${totalFirecrawlUpdated} updated`);

    // Step 3: Run Apify scraping
    console.log('Starting Apify scraping...');
    const apifyScraper = new ApifyScraper();
    const apifyConferences = await apifyScraper.scrapeAllTargets();

    console.log(`Apify scraping completed: ${apifyConferences.length} conferences found`);

    // Step 4: Process and store Apify conferences
    let totalApifyAdded = 0;
    let totalApifyUpdated = 0;

    // Group conferences by domain using the ApifyScraper's classification
    const conferencesByDomain = new Map<string, Conference[]>();

    for (const conference of apifyConferences) {
      // Use the existing ApifyScraper's classification method to determine domain
      const domainSlug = apifyScraper.classifyDomain(conference.name, conference.description);

      if (!conferencesByDomain.has(domainSlug)) {
        conferencesByDomain.set(domainSlug, []);
      }
      conferencesByDomain.get(domainSlug)!.push(conference);
    }

    // Store conferences by domain
    for (const [domainSlug, conferences] of conferencesByDomain) {
      try {
        if (conferences.length > 0) {
          console.log(`Inserting ${conferences.length} conferences for domain ${domainSlug}...`);
          const { added, updated } = await upsertConferences(conferences, domainSlug);
          totalApifyAdded += added;
          totalApifyUpdated += updated;
          console.log(`Domain ${domainSlug}: ${added} added, ${updated} updated`);
        }
      } catch (error) {
        console.error(`Error storing Apify conferences for domain ${domainSlug}:`, error);
      }
    }

    // Update scrape log
    if (scrapeLogId) {
      await updateScrapeLog(scrapeLogId, {
        status: 'success',
        conferencesFound: apifyConferences.length,
        conferencesAdded: totalApifyAdded,
        conferencesUpdated: totalApifyUpdated,
        completedAt: new Date().toISOString(),
        metadata: {
          targetsScraped: 1, // Number of scraping targets
          domainsProcessed: conferencesByDomain.size,
          totalProcessingTime: Date.now() - startTime.getTime()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping completed successfully',
      data: {
        github: {
          found: domains.reduce((sum, domain) => sum + domain.conferences.length, 0),
          added: totalGitHubAdded,
          updated: totalGitHubUpdated
        },
        firecrawl: {
          found: Array.from(firecrawlResults.values()).reduce((sum, conferences) => sum + conferences.length, 0),
          added: totalFirecrawlAdded,
          updated: totalFirecrawlUpdated
        },
        apify: {
          found: apifyConferences.length,
          added: totalApifyAdded,
          updated: totalApifyUpdated
        },
        totalProcessingTime: Date.now() - startTime.getTime()
      }
    });

  } catch (error) {
    console.error('Error during scraping:', error);

    if (scrapeLogId) {
      await updateScrapeLog(scrapeLogId, {
        status: 'error',
        completedAt: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          totalProcessingTime: Date.now() - startTime.getTime()
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check scraping status
export async function GET() {
  try {
    const { getAllDomainsWithConferences, getLatestScrapeLogs } = await import('@/lib/database');

    const [domains, scrapeLogs] = await Promise.all([
      getAllDomainsWithConferences(),
      getLatestScrapeLogs(5)
    ]);

    const totalConferences = domains.reduce((total, domain) => total + domain.conferences.length, 0);
    const newConferences = domains.reduce((total, domain) =>
      total + domain.conferences.filter(c => c.isNew).length, 0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalConferences,
        newConferences,
        domains: domains.length,
        latestScrapeLogs: scrapeLogs
      }
    });

  } catch (error) {
    console.error('Error fetching scraping status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scraping status'
      },
      { status: 500 }
    );
  }
} 