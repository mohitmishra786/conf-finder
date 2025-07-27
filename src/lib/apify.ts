import { ApifyClient } from 'apify-client';
import { Conference } from '@/types/conference';
import { parseISO, isAfter, startOfDay, parse, isValid } from 'date-fns';

// Domain classification keywords with priority order
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ai: [
    'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning', 'neural networks', 
    'chatgpt', 'gpt', 'llm', 'large language models', 'natural language processing', 'nlp',
    'computer vision', 'robotics', 'autonomous systems', 'intelligent systems', 'cognitive computing',
    'icait', 'icmlc', 'icml', 'iccv', 'nips', 'neurips', 'aaai', 'ijcai', 'iclr', 'icann', 'icprml'
  ],
  data: [
    'data science', 'data analytics', 'big data', 'data engineering', 'business intelligence', 'bi',
    'data mining', 'data visualization', 'statistics', 'predictive analytics', 'data governance'
  ],
  databases: [
    'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'data warehousing', 'data lakes', 'data modeling'
  ],
  devops: [
    'devops', 'ci/cd', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'infrastructure',
    'continuous integration', 'continuous deployment', 'containerization', 'orchestration'
  ],
  cloud: [
    'cloud computing', 'aws', 'azure', 'gcp', 'serverless', 'microservices', 'cloud native',
    'distributed systems', 'scalability', 'cloud architecture'
  ],
  security: [
    'cybersecurity', 'security', 'penetration testing', 'ethical hacking', 'infosec',
    'network security', 'application security', 'data protection', 'privacy', 'compliance'
  ],
  web: [
    'web development', 'frontend', 'backend', 'full stack', 'javascript', 'react', 'vue', 'angular',
    'web technologies', 'web applications', 'web services', 'api development'
  ],
  gaming: [
    'game development', 'gaming', 'unity', 'unreal engine', 'game design', 'game programming',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'game engines'
  ],
  frontend: [
    'frontend', 'ui/ux', 'user interface', 'user experience', 'css', 'html', 'javascript',
    'responsive design', 'web design', 'ui design', 'ux design'
  ],
  backend: [
    'backend', 'api', 'server-side', 'node.js', 'python', 'java', 'go', 'server development',
    'database design', 'system architecture'
  ],
  testing: [
    'testing', 'qa', 'quality assurance', 'automated testing', 'test automation',
    'unit testing', 'integration testing', 'performance testing', 'test-driven development'
  ],
  architecture: [
    'software architecture', 'system design', 'design patterns', 'microservices',
    'enterprise architecture', 'solution architecture', 'technical architecture',
    'software engineering', 'software maintenance', 'software testing', 'software science'
  ],
  ux: [
    'user experience', 'ux', 'user interface', 'ui', 'design thinking', 'usability',
    'user research', 'interaction design', 'information architecture'
  ]
};

export class ApifyScraper {
  private client: ApifyClient;

  constructor() {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
      throw new Error('APIFY_TOKEN environment variable is required');
    }
    this.client = new ApifyClient({ token });
  }

  // Classify conference domain based on name and description with priority scoring
  public classifyDomain(name: string, description?: string): string {
    const text = `${name.toLowerCase()} ${description?.toLowerCase() || ''}`;
    const scores: Record<string, number> = {};
    
    // Score each domain based on keyword matches
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // Give higher weight to matches in the name vs description
          const nameMatch = name.toLowerCase().includes(keyword);
          const descMatch = description?.toLowerCase().includes(keyword);
          
          if (nameMatch) {
            score += 10; // High weight for name matches
          } else if (descMatch) {
            score += 3;  // Lower weight for description matches
          }
          
          // Bonus for exact acronym matches (like ICMLC, ICAIT)
          if (keyword.length <= 5 && name.toLowerCase().includes(keyword.toLowerCase())) {
            score += 15; // Very high weight for acronym matches
          }
        }
      }
      if (score > 0) {
        scores[domain] = score;
      }
    }
    
    // Return the domain with the highest score
    if (Object.keys(scores).length > 0) {
      const bestDomain = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
      console.log(`Classified "${name}" as ${bestDomain} (score: ${scores[bestDomain]})`);
      return bestDomain;
    }
    
    // Default to 'web' if no specific domain is found
    console.log(`No specific domain found for "${name}", defaulting to web`);
    return 'web';
  }

  // Enhanced date extraction from various formats
  private extractDate(dateStr: string): string | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }

    try {
      // Try direct parsing first
      const date = new Date(dateStr);
      if (isValid(date)) {
        return date.toISOString().split('T')[0];
      }

      // Try date-fns parse with various formats
      const formats = [
        'MMM dd yyyy',
        'MMM d yyyy', 
        'MMMM dd yyyy',
        'MMMM d yyyy',
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'yyyy/MM/dd'
      ];

      for (const format of formats) {
        try {
          const parsedDate = parse(dateStr, format, new Date());
          if (isValid(parsedDate)) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch {
          continue;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  // Parse markdown content to extract conferences
  private parseMarkdownContent(markdown: string, currentYear: number): Conference[] {
    const conferences: Conference[] = [];
    const lines = markdown.split('\n');
    let currentMonth = '';
    let currentYearFromHeader = currentYear;

    console.log(`Parsing markdown content with ${lines.length} lines...`);

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;

      // Check for month/year headers (e.g., "**August, 2025**" or "## August 2025")
      const monthYearMatch = trimmedLine.match(/\*\*(.*?),\s*(\d{4})\*\*|##\s*(.*?)\s+(\d{4})/i);
      if (monthYearMatch) {
        currentMonth = monthYearMatch[1] || monthYearMatch[3];
        currentYearFromHeader = parseInt(monthYearMatch[2] || monthYearMatch[4]);
        console.log(`Found month/year header: ${currentMonth} ${currentYearFromHeader}`);
        continue;
      }

      // Check for bullet points (starting with * or -)
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const conference = this.parseBulletPoint(trimmedLine, currentMonth, currentYearFromHeader);
        if (conference) {
          conferences.push(conference);
        }
      }
    }

    console.log(`Extracted ${conferences.length} conferences from markdown`);
    return conferences;
  }

  // Parse individual bullet point line
  private parseBulletPoint(line: string, currentMonth: string, currentYear: number): Conference | null {
    try {
      // Remove bullet point marker
      const cleanLine = line.replace(/^[\*\-]\s*/, '').trim();
      
      // Multiple regex patterns to handle different formats
      const patterns = [
        // Pattern 1: "Aug 07 [Conference Name](url) - City, Country"
        /\*?\s*(\w{3}\s+\d{1,2})\s*\[(.*?)\]\((.*?)\s*(?:".*?")?\)\s*-\s*(.*?),?\s*(.*)/i,
        
        // Pattern 2: "Aug 07 Conference Name - City, Country" (with URL in <a> tag)
        /\*?\s*(\w{3}\s+\d{1,2})\s*<a\s+href="(.*?)">(.*?)<\/a>\s*-\s*(.*?),?\s*(.*)/i,
        
        // Pattern 3: "Aug 07 Conference Name - City, Country" (plain text)
        /\*?\s*(\w{3}\s+\d{1,2})\s+(.*?)\s*-\s*(.*?),?\s*(.*)/i,
        
        // Pattern 4: "Conference Name - Aug 07 - City, Country"
        /\*?\s*(.*?)\s*-\s*(\w{3}\s+\d{1,2})\s*-\s*(.*?),?\s*(.*)/i,
        
        // Pattern 5: "Conference Name (Aug 07) - City, Country"
        /\*?\s*(.*?)\s*\((\w{3}\s+\d{1,2})\)\s*-\s*(.*?),?\s*(.*)/i
      ];

      let match = null;
      let dateStr = '';
      let name = '';
      let url = '';
      let city = '';
      let country = '';

      for (const pattern of patterns) {
        match = cleanLine.match(pattern);
        if (match) {
          if (pattern === patterns[0]) {
            // Pattern 1: date, name, url, city, country
            [, dateStr, name, url, city, country] = match;
          } else if (pattern === patterns[1]) {
            // Pattern 2: date, url, name, city, country
            [, dateStr, url, name, city, country] = match;
          } else if (pattern === patterns[2]) {
            // Pattern 3: date, name, city, country
            [, dateStr, name, city, country] = match;
          } else if (pattern === patterns[3]) {
            // Pattern 4: name, date, city, country
            [, name, dateStr, city, country] = match;
          } else if (pattern === patterns[4]) {
            // Pattern 5: name, date, city, country
            [, name, dateStr, city, country] = match;
          }
          break;
        }
      }

      if (!match || !name || !dateStr) {
        console.log(`No match found for line: ${line}`);
        return null;
      }

      // Parse date
      const fullDateStr = `${dateStr} ${currentYear}`;
      const startDate = this.extractDate(fullDateStr);
      
      if (!startDate) {
        console.log(`Invalid date: ${fullDateStr}`);
        return null;
      }

      // Check if conference is in the future
      const conferenceDate = parseISO(startDate);
      const now = startOfDay(new Date());
      if (!isAfter(conferenceDate, now)) {
        console.log(`Skipping past conference: ${name} (${startDate})`);
        return null;
      }

      // Determine if it's online
      const locationText = `${city} ${country}`.toLowerCase();
      const online = locationText.includes('virtual') || 
                    locationText.includes('online') || 
                    name.toLowerCase().includes('virtual') ||
                    name.toLowerCase().includes('online');

      // Classify domain
      const domainSlug = this.classifyDomain(name);

      const conference: Conference = {
        name: name.trim(),
        url: url || `https://example.com/${encodeURIComponent(name)}`, // Fallback URL
        startDate,
        endDate: startDate, // Assume same as start date
        city: city.trim(),
        country: country.trim(),
        online,
        cfp: undefined,
        twitter: undefined,
        description: `Conference found in markdown content`,
        source: 'scraped',
        scrapedAt: new Date().toISOString(),
        isNew: true
      };

      console.log(`Created conference from markdown: ${name} (${startDate})`);
      return conference;

    } catch (error) {
      console.error(`Error parsing bullet point: ${line}`, error);
      return null;
    }
  }

  // Parse scraped data into Conference objects
  private parseScrapedData(items: Record<string, unknown>[]): Conference[] {
    const conferences: Conference[] = [];
    const now = startOfDay(new Date());
    const currentYear = new Date().getFullYear();

    console.log(`Parsing ${items.length} scraped items...`);

    for (const item of items) {
      try {
        console.log('Processing item:', JSON.stringify(item, null, 2));
        
        // Check if item has markdown content
        if (item.markdown && typeof item.markdown === 'string') {
          console.log('Found markdown content, parsing...');
          const markdownConferences = this.parseMarkdownContent(item.markdown as string, currentYear);
          conferences.push(...markdownConferences);
          continue;
        }

        // Fall back to structured field extraction
        const name = (item.name as string) || (item.title as string) || (item.eventName as string) || (item.event_name as string);
        const url = (item.url as string) || (item.link as string) || (item.eventUrl as string) || (item.event_url as string);
        const description = (item.description as string) || (item.summary as string) || (item.details as string);
        
        if (!name || !url) {
          console.log('Skipping item due to missing name or URL');
          continue;
        }

        // Extract dates
        const startDate = this.extractDate((item.startDate as string) || (item.start_date as string) || (item.start as string) || (item.date as string));
        const endDate = this.extractDate((item.endDate as string) || (item.end_date as string) || (item.end as string) || (startDate || ''));
        
        if (!startDate) {
          console.log('Skipping item due to missing start date');
          continue;
        }

        // Check if conference is in the future
        const conferenceDate = parseISO(startDate);
        if (!isAfter(conferenceDate, now)) {
          console.log('Skipping past conference:', name);
          continue;
        }

        // Extract location information
        const location = (item.location as string) || (item.venue as string) || (item.address as string) || '';
        const city = (item.city as string) || '';
        const country = (item.country as string) || '';
        const online = (item.online as boolean) || location.toLowerCase().includes('online') || name.toLowerCase().includes('virtual');

        // Classify domain
        const domainSlug = this.classifyDomain(name, description);

        // Extract CFP information
        const cfpUntil = item.cfpUntil ? this.extractDate(item.cfpUntil as string) : undefined;
        const cfpUrl = (item.cfpUrl as string) || undefined;

        // Extract social media
        const twitter = (item.twitter as string) || (item.twitterHandle as string) || undefined;

        const conference: Conference = {
          name,
          url,
          startDate,
          endDate: endDate || startDate,
          city,
          country,
          online,
          cfp: cfpUntil ? { until: cfpUntil, url: cfpUrl || '' } : undefined,
          twitter,
          description,
          source: 'scraped',
          scrapedAt: new Date().toISOString(),
          isNew: true
        };

        console.log('Created conference:', JSON.stringify(conference, null, 2));
        conferences.push(conference);
      } catch (error) {
        console.error('Error parsing conference data:', error);
        continue;
      }
    }

    console.log(`Successfully parsed ${conferences.length} conferences`);
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

  // Scrape conferences from multiple sources with exponential backoff retry logic
  async scrapeAllTargets(): Promise<Conference[]> {
    const allConferences: Conference[] = [];
    
    // Define targets with priority order: GitHub -> FireCrawl -> Apify
    const targets = [
      {
        name: 'Conference Index',
        url: 'https://conferenceindex.org/conferences/technology',
        actor: 'apify/website-content-crawler',
        maxRetries: 3
      },
      {
        name: 'Meetup.com Tech Events',
        url: 'https://www.meetup.com/find/?source=EVENTS&location=us--New-York--NY&distance=twentyFiveMiles&sort=recommended&eventType=inPerson&categoryId=546',
        actor: 'filip_cicvarek/meetup-scraper',
        maxRetries: 3
      },
      {
        name: 'Eventbrite Tech Events',
        url: 'https://www.eventbrite.com/d/united-states/technology/',
        actor: 'apify/website-content-crawler',
        maxRetries: 3
      }
    ];

    for (const target of targets) {
      try {
        console.log(`\n--- Starting Apify scraping for ${target.name} ---`);
        
        const conferences = await this.scrapeTargetWithRetry(target);
        allConferences.push(...conferences);
        
        console.log(`Completed ${target.name}: ${conferences.length} conferences found`);
        
        // Add delay between targets to avoid rate limits
        if (target !== targets[targets.length - 1]) {
          console.log('Waiting 2 seconds before next target...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing target ${target.name}:`, error);
        continue;
      }
    }

    console.log(`\nApify scraping completed: ${allConferences.length} total conferences found`);
    return this.removeDuplicates(allConferences);
  }

  // Scrape a single target with exponential backoff retry logic
  private async scrapeTargetWithRetry(target: {
    name: string;
    url: string;
    actor: string;
    maxRetries: number;
  }): Promise<Conference[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= target.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${target.maxRetries} for ${target.name}...`);
        
        const run = await this.client.actor(target.actor).call({
          startUrls: [{ url: target.url }],
          maxRequestRetries: 1,
          maxConcurrency: 2,
          maxRequestsPerCrawl: 10,
          // Enhanced pageFunction for better event extraction
          pageFunction: `
            async function pageFunction(context) {
              const { $, request, log } = context;
              
              log.info('Processing page:', request.url);
              
              const events = [];
              
              // Extract events based on the source
              if (request.url.includes('meetup.com')) {
                // Meetup.com specific extraction
                $('.eventCard').each((i, elem) => {
                  const $elem = $(elem);
                  const name = $elem.find('.eventCardHead--title').text().trim();
                  const url = $elem.find('a').attr('href');
                  const date = $elem.find('time').attr('datetime');
                  const location = $elem.find('.eventCardHead--location').text().trim();
                  
                  if (name && url) {
                    events.push({
                      name,
                      url: url.startsWith('http') ? url : 'https://meetup.com' + url,
                      description: $elem.find('.eventCardHead--description').text().trim(),
                      date: date || '',
                      location
                    });
                  }
                });
              } else if (request.url.includes('eventbrite.com')) {
                // Eventbrite specific extraction
                $('[data-testid="event-card"]').each((i, elem) => {
                  const $elem = $(elem);
                  const name = $elem.find('h2').text().trim();
                  const url = $elem.find('a').attr('href');
                  const date = $elem.find('time').attr('datetime');
                  const location = $elem.find('[data-testid="event-card-location"]').text().trim();
                  
                  if (name && url) {
                    events.push({
                      name,
                      url: url.startsWith('http') ? url : 'https://eventbrite.com' + url,
                      description: $elem.find('p').text().trim(),
                      date: date || '',
                      location
                    });
                  }
                });
              } else {
                // Generic extraction for other sites
                $('a').each((i, elem) => {
                  const $elem = $(elem);
                  const href = $elem.attr('href');
                  const text = $elem.text().trim();
                  
                  if (href && text && text.length > 3) {
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('conference') || 
                        lowerText.includes('event') || 
                        lowerText.includes('meetup') ||
                        lowerText.includes('summit') ||
                        lowerText.includes('symposium') ||
                        lowerText.includes('workshop')) {
                      
                      events.push({
                        name: text,
                        url: href.startsWith('http') ? href : new URL(href, request.url).href,
                        description: $elem.closest('div').text().substring(0, 200) || '',
                        date: '',
                        location: ''
                      });
                    }
                  }
                });
              }
              
              log.info('Total events found:', events.length);
              return events;
            }
          `
        });

        console.log('Apify run completed, fetching results...');

        if (run && run.defaultDatasetId) {
          const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
          console.log(`Raw items from Apify: ${items.length}`);
          
          if (items.length > 0) {
            console.log('Sample raw item:', JSON.stringify(items[0], null, 2));
          }
          
          const conferences = this.parseScrapedData(items);
          console.log(`Found ${conferences.length} conferences from ${target.name}`);
          return conferences;
        } else {
          console.log('No dataset found in Apify run');
          return [];
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed for ${target.name}:`, error);
        
        if (attempt < target.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error(`Failed to scrape ${target.name} after ${target.maxRetries} attempts`);
  }

  // Get scraping statistics
  async getScrapingStats(): Promise<{
    totalTargets: number;
    successfulTargets: number;
    totalConferences: number;
    estimatedCost: number;
  }> {
    return {
      totalTargets: 1,
      successfulTargets: 0,
      totalConferences: 0,
      estimatedCost: 0
    };
  }
} 