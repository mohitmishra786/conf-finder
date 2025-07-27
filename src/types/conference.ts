export interface Conference {
  id?: number;
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  online: boolean;
  cfp?: {
    until: string;
    url: string;
  };
  twitter?: string;
  description?: string;
  source?: 'github' | 'scraped' | 'firecrawl';
  scrapedAt?: string;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Domain {
  id?: number;
  slug: string;
  name: string;
  description: string;
  conferences: Conference[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScrapeLog {
  id?: number;
  scrapeType: 'github' | 'apify' | 'firecrawl';
  status: 'success' | 'error' | 'partial';
  conferencesFound: number;
  conferencesAdded: number;
  conferencesUpdated: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  domain: Domain;
  conferences: Conference[];
} 