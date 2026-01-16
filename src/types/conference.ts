/**
 * Conference and Domain types for conf-finder v2.0
 *
 * Enhanced schema with CFP focus and financial aid detection
 */

export interface Conference {
  // Core identification
  id: string;
  name: string;
  url: string;

  // Dates (ISO 8601 format: YYYY-MM-DD)
  startDate: string;
  endDate: string;

  // Location
  city: string;
  country: string;
  continent: string;
  online: boolean;
  hybrid: boolean;

  // Call for Proposals (CFP) - KEY FEATURE
  cfp: {
    url: string;
    endDate: string;
    daysRemaining: number;
    isOpen: boolean;
  } | null;

  // Financial Aid - KEY FEATURE
  financialAid: {
    available: boolean;
    types: string[];
    url: string | null;
    notes: string | null;
  };

  // Categorization
  domain: string;
  tags: string[];

  // Metadata
  description: string | null;
  twitter: string | null;
  mastodon: string | null;
  cocUrl: string | null;

  // Source tracking
  source: 'confs.tech' | 'sessionize' | 'manual';
  lastUpdated: string;
}

export interface Domain {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  conferenceCount: number;
}

export interface ConferenceStats {
  totalConferences: number;
  openCfps: number;
  withFinancialAid: number;
  byContinent: Record<string, number>;
}

export interface ConferenceData {
  lastUpdated: string;
  source: string;
  version: string;
  stats: ConferenceStats;
  domains: Domain[];
  conferences: Conference[];
}

export interface SearchResult {
  domain: Domain;
  conferences: Conference[];
}

// Filter options for the UI
export interface ConferenceFilters {
  domain?: string;
  cfpOpen?: boolean;
  hasFinancialAid?: boolean;
  searchTerm?: string;
  continent?: string;
  online?: boolean;
}

// Sort options
export type SortOption = 'cfpDeadline' | 'startDate' | 'name';