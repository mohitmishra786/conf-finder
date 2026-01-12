import FireCrawlApp from '@mendable/firecrawl-js';
import { Conference } from '@/types/conference';
import { parseISO } from 'date-fns';
import { DOMAIN_MAPPINGS } from '@/constants/domains';

// Domain-specific search queries - more specific to target actual conferences
const DOMAIN_SEARCH_QUERIES: Record<string, string> = {
  ai: 'AI conference 2025 "call for papers" "registration" "event"',
  data: 'Data Science conference 2025 "call for papers" "registration" "event"',
  databases: 'Database conference 2025 "call for papers" "registration" "event"',
  devops: 'DevOps conference 2025 "call for papers" "registration" "event"',
  cloud: 'Cloud Computing conference 2025 "call for papers" "registration" "event"',
  security: 'Cybersecurity conference 2025 "call for papers" "registration" "event"',
  web: 'Web Development conference 2025 "call for papers" "registration" "event"',
  gaming: 'Game Development conference 2025 "call for papers" "registration" "event"',
  frontend: 'Frontend conference 2025 "call for papers" "registration" "event"',
  backend: 'Backend conference 2025 "call for papers" "registration" "event"',
  testing: 'Software Testing conference 2025 "call for papers" "registration" "event"',
  architecture: 'Software Architecture conference 2025 "call for papers" "registration" "event"',
  ux: 'User Experience conference 2025 "call for papers" "registration" "event"'
};

export class FireCrawlScraper {
  private app: FireCrawlApp;

  constructor() {
    const apiKey = process.env.FIRECRAWL_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_KEY environment variable is required');
    }
    this.app = new FireCrawlApp({ apiKey });
  }

  // Extract date from various formats
  private extractDate(dateStr: string): string | null {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  // Enhanced date extraction from text
  private extractDateFromText(text: string): string | null {
    // Try multiple date patterns
    const patterns = [
      // YYYY-MM-DD
      /\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/,
      // MM/DD/YYYY
      /\b(0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])[/-](20\d{2})\b/,
      // DD/MM/YYYY
      /\b(0[1-9]|[12]\d|3[01])[/-](0[1-9]|1[0-2])[/-](20\d{2})\b/,
      // Month DD, YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(0[1-9]|[12]\d|3[01]),?\s+(20\d{2})\b/i,
      // DD Month YYYY
      /\b(0[1-9]|[12]\d|3[01])\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i,
      // YYYY-MM
      /\b(20\d{2})[-/](0[1-9]|1[0-2])\b/,
      // Just year 2025/2026
      /\b(202[5-6])\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let dateStr = match[0];

        // Handle month names
        if (match[1] && isNaN(Number(match[1]))) {
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'];
          const monthIndex = monthNames.indexOf(match[1].toLowerCase());
          if (monthIndex !== -1) {
            const month = String(monthIndex + 1).padStart(2, '0');
            const day = match[2] || '01';
            const year = match[3];
            dateStr = `${year}-${month}-${day}`;
          }
        }

        // Handle YYYY-MM format by adding day 01
        if (/^\d{4}-\d{2}$/.test(dateStr)) {
          dateStr = `${dateStr}-01`;
        }

        // Handle just year by adding month and day
        if (/^\d{4}$/.test(dateStr)) {
          dateStr = `${dateStr}-01-01`;
        }

        return this.extractDate(dateStr);
      }
    }

    return null;
  }

  // Check if a result is likely a conference event
  private isConferenceEvent(title: string, description: string, url: string): boolean {
    const text = `${title} ${description} ${url}`.toLowerCase();

    // Conference-related keywords that indicate this is an actual event
    const conferenceKeywords = [
      'conference', 'summit', 'symposium', 'workshop', 'meetup', 'event',
      'call for papers', 'cfp', 'registration', 'register', 'attend',
      'speakers', 'agenda', 'schedule', 'venue', 'location'
    ];

    // Keywords that indicate this is NOT a conference (articles, blogs, etc.)
    const nonConferenceKeywords = [
      'blog', 'article', 'post', 'news', 'announcement', 'deadline',
      'list of', 'top 10', 'best', 'guide', 'tutorial', 'how to',
      'review', 'recap', 'summary', 'report', 'analysis'
    ];

    // Check for conference keywords
    const hasConferenceKeywords = conferenceKeywords.some(keyword => text.includes(keyword));

    // Check for non-conference keywords
    const hasNonConferenceKeywords = nonConferenceKeywords.some(keyword => text.includes(keyword));

    // More intelligent filtering:
    // 1. If it has obvious non-conference keywords, reject it
    if (hasNonConferenceKeywords) {
      console.log(`Rejecting due to non-conference keywords: "${title}"`);
      return false;
    }

    // 2. If it has conference keywords, accept it
    if (hasConferenceKeywords) {
      console.log(`Accepting due to conference keywords: "${title}"`);
      return true;
    }

    // 3. If the title contains "conference" or "summit" or "2025", it's likely a conference
    const titleLower = title.toLowerCase();
    if (titleLower.includes('conference') || titleLower.includes('summit') || titleLower.includes('2025')) {
      console.log(`Accepting based on title keywords: "${title}"`);
      return true;
    }

    // 4. If the URL contains conference-related terms, accept it
    const urlLower = url.toLowerCase();
    if (urlLower.includes('conference') || urlLower.includes('summit') || urlLower.includes('event')) {
      console.log(`Accepting based on URL keywords: "${title}"`);
      return true;
    }

    console.log(`Rejecting - no clear conference indicators: "${title}"`);
    return false;
  }

  // Parse FireCrawl search results into Conference objects
  private parseSearchResults(results: Record<string, unknown>[], domainSlug: string): Conference[] {
    const conferences: Conference[] = [];

    console.log(`Parsing ${results.length} search results for domain ${domainSlug}...`);

    for (const result of results) {
      try {
        const { title, description, url } = result;

        if (!title || !url) {
          console.log('Skipping result due to missing title or URL');
          continue;
        }

        console.log(`Processing result: "${title}"`);
        console.log(`URL: ${url}`);
        console.log(`Description: ${description || 'No description'}`);

        // Check if this is likely a conference event
        if (!this.isConferenceEvent(title as string, (description as string) || '', url as string)) {
          console.log('Skipping non-conference result:', title);
          continue;
        }

        // Extract date from title or description using enhanced extraction
        const fullText = `${title as string} ${(description as string) || ''}`;
        let startDate = this.extractDateFromText(fullText);

        // If no date found, try to extract from URL or use a default future date
        if (!startDate) {
          // Try to extract year from URL
          const urlYearMatch = (url as string).match(/\b(202[5-6])\b/);
          if (urlYearMatch) {
            startDate = `${urlYearMatch[1]}-06-01`; // Default to June 1st of the year
          } else {
            // Try to extract year from title/description
            const yearMatch = fullText.match(/\b(202[5-6])\b/);
            if (yearMatch) {
              startDate = `${yearMatch[1]}-06-01`;
            } else {
              // Default to 2025 if no year found
              startDate = '2025-06-01';
            }
          }
          console.log(`Using default date ${startDate} for: ${title}`);
        }

        // Check if conference is in the future
        // Only filter out conferences that are clearly in the past (2024 or earlier)
        const conferenceDate = parseISO(startDate);
        const currentYear = new Date().getFullYear();
        const conferenceYear = conferenceDate.getFullYear();

        if (conferenceYear < currentYear) {
          console.log('Skipping past conference:', title);
          continue;
        }

        // Extract location information from description
        const locationMatch = (description as string | undefined)?.match(/(?:in|at|@)\s+([^,]+(?:,\s*[^,]+)*)/i);
        if (locationMatch) {
          console.log(`Potential location found: ${locationMatch[1].trim()}`);
        }

        // Determine if it's online
        const titleLower = (title as string).toLowerCase();
        const descLower = ((description as string) || '').toLowerCase();
        const online = titleLower.includes('virtual') ||
          titleLower.includes('online') ||
          descLower.includes('virtual') ||
          descLower.includes('online');

        const conference: Conference = {
          name: title as string,
          url: url as string,
          startDate,
          endDate: startDate, // Use same date as end date if not specified
          city: '',
          country: '',
          online,
          cfp: undefined,
          twitter: undefined,
          description: (description as string) || '',
          source: 'firecrawl',
          scrapedAt: new Date().toISOString(),
          isNew: true
        };

        console.log('Created conference:', JSON.stringify(conference, null, 2));
        conferences.push(conference);
      } catch (error) {
        console.error('Error parsing search result:', error);
        continue;
      }
    }

    console.log(`Successfully parsed ${conferences.length} conferences for domain ${domainSlug}`);
    return this.removeDuplicates(conferences);
  }

  // Remove duplicate conferences based on name and URL
  private removeDuplicates(conferences: Conference[]): Conference[] {
    const seen = new Set<string>();
    return conferences.filter(conference => {
      const key = `${conference.name.toLowerCase()}-${conference.url.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Search for conferences in a specific domain
  async searchDomain(domainSlug: string, onConferencesFound?: (conferences: Conference[], domainSlug: string) => Promise<void>): Promise<Conference[]> {
    const query = DOMAIN_SEARCH_QUERIES[domainSlug];

    if (!query) {
      console.log(`No search query found for domain: ${domainSlug}`);
      return [];
    }

    console.log(`Searching for ${domainSlug} conferences with query: "${query}"`);

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Making FireCrawl API call (Attempt ${attempt}/${maxRetries})...`);
        const searchResult = await this.app.search(query, {
          limit: 5,
          scrapeOptions: {
            formats: ["markdown"]
          }
        });

        console.log('FireCrawl API response:', JSON.stringify(searchResult, null, 2));

        if (searchResult.success && searchResult.data) {
          console.log(`Found ${searchResult.data.length} results for query: "${query}"`);
          if (searchResult.data.length > 0) {
            console.log('Sample result:', JSON.stringify(searchResult.data[0], null, 2));
          }
          const results = (searchResult.data as unknown as Record<string, unknown>[]) || [];
          const conferences = this.parseSearchResults(results, domainSlug);

          console.log(`Parsed ${conferences.length} conferences for domain ${domainSlug}`);

          // If callback provided, insert conferences immediately
          if (onConferencesFound && conferences.length > 0) {
            await onConferencesFound(conferences, domainSlug);
          }

          return conferences;
        } else {
          console.log(`No results found for query: "${query}"`);
          console.log('Search result:', searchResult);
          return [];
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed for query "${query}":`, error);

        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRateLimitError = errorMessage.includes('rate limit') ||
          errorMessage.includes('429') ||
          errorMessage.includes('too many requests');

        if (attempt < maxRetries) {
          // Use a fixed delay of 18 seconds on rate limit errors, otherwise exponential backoff
          let delay: number;
          if (isRateLimitError) {
            delay = 20000; // 18 seconds, as FireCrawl rate limit resets around this time
            console.log(`Rate limit hit. Waiting ${delay}ms (18s) before retry...`);
          } else {
            delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`Waiting ${delay}ms before retry...`);
          }
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`Failed to search for query "${query}" after ${maxRetries} attempts`);
        }
      }
    }

    return [];
  }

  // Search for conferences across specific domains (for testing)
  async scrapeSpecificDomains(domainSlugs: string[], onConferencesFound?: (conferences: Conference[], domainSlug: string) => Promise<void>): Promise<Map<string, Conference[]>> {
    const results = new Map<string, Conference[]>();

    console.log(`Starting FireCrawl scraping for ${domainSlugs.length} domains: ${domainSlugs.join(', ')}...`);

    for (const domainSlug of domainSlugs) {
      try {
        console.log(`\n--- Processing domain: ${domainSlug} ---`);
        const conferences = await this.searchDomain(domainSlug, onConferencesFound);
        results.set(domainSlug, conferences);

        console.log(`Completed domain ${domainSlug}: ${conferences.length} conferences found`);

        // Add delay between domains to avoid rate limits
        if (domainSlug !== domainSlugs[domainSlugs.length - 1]) {
          console.log('Waiting 10 seconds before next domain...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error) {
        console.error(`Error processing domain ${domainSlug}:`, error);
        results.set(domainSlug, []);
      }
    }

    const totalConferences = Array.from(results.values()).reduce((sum, conferences) => sum + conferences.length, 0);
    console.log(`\nFireCrawl scraping completed: ${totalConferences} total conferences found across ${domainSlugs.length} domains`);

    return results;
  }

  // Search for conferences across all domains
  async scrapeAllDomains(onConferencesFound?: (conferences: Conference[], domainSlug: string) => Promise<void>): Promise<Map<string, Conference[]>> {
    const results = new Map<string, Conference[]>();
    const failedDomains: string[] = [];
    const domains = Object.keys(DOMAIN_MAPPINGS);

    console.log(`Starting FireCrawl scraping for ${domains.length} domains...`);

    for (const domainSlug of domains) {
      try {
        console.log(`\n--- Processing domain: ${domainSlug} ---`);
        const conferences = await this.searchDomain(domainSlug, onConferencesFound);
        results.set(domainSlug, conferences);

        console.log(`Completed domain ${domainSlug}: ${conferences.length} conferences found`);

        // Add delay between domains to avoid rate limits
        if (domainSlug !== domains[domains.length - 1]) {
          console.log('Waiting 3 seconds before next domain...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Error processing domain ${domainSlug}:`, error);
        failedDomains.push(domainSlug);
        results.set(domainSlug, []);
      }
    }

    const totalConferences = Array.from(results.values()).reduce((sum, conferences) => sum + conferences.length, 0);
    const successfulDomains = domains.length - failedDomains.length;

    console.log(`\nFireCrawl scraping completed: ${totalConferences} total conferences found across ${successfulDomains}/${domains.length} domains`);

    if (failedDomains.length > 0) {
      console.error(`Failed domains: ${failedDomains.join(', ')}`);
    }

    return results;
  }

  // Get scraping statistics
  async getScrapingStats(): Promise<{
    totalDomains: number;
    successfulDomains: number;
    totalConferences: number;
    estimatedCost: number;
  }> {
    const domains = Object.keys(DOMAIN_MAPPINGS);
    const totalDomains = domains.length;
    const estimatedCost = totalDomains * 0.1; // Rough estimate

    return {
      totalDomains,
      successfulDomains: totalDomains, // Assume all domains will be processed
      totalConferences: 0, // Will be calculated during scraping
      estimatedCost
    };
  }
} 