export interface Conference {
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
}

export interface Domain {
  slug: string;
  name: string;
  description: string;
  conferences: Conference[];
}

export interface SearchResult {
  domain: Domain;
  conferences: Conference[];
} 