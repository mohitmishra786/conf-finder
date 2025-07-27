import { Conference, Domain } from '@/types/conference';
import { DOMAIN_MAPPINGS, GITHUB_API_BASE, RAW_CONTENT_BASE } from '@/constants/domains';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

export async function getCurrentYear(): Promise<number> {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If we're in the second half of the year, also include next year's conferences
  if (now.getMonth() >= 6) {
    return currentYear + 1;
  }
  
  return currentYear;
}

export async function getAvailableDomains(year: number): Promise<string[]> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/contents/conferences/${year}`, {
      next: { revalidate: 43200 } // 12 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch domains: ${response.status}`);
    }
    
    const data = await response.json();
    const domains = data
      .filter((item: { type: string; name: string }) => item.type === 'file' && item.name.endsWith('.json'))
      .map((item: { name: string }) => item.name.replace('.json', ''));
    
    return domains;
  } catch (error) {
    console.error('Error fetching domains:', error);
    return [];
  }
}

export async function getConferencesForDomain(domain: string, year: number): Promise<Conference[]> {
  try {
    const response = await fetch(`${RAW_CONTENT_BASE}/conferences/${year}/${domain}.json`, {
      next: { revalidate: 43200 } // 12 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conferences for ${domain}: ${response.status}`);
    }
    
    const conferences: Conference[] = await response.json();
    
    // Filter for upcoming conferences only
    const now = startOfDay(new Date());
    const upcomingConferences = conferences.filter(conference => {
      try {
        const startDate = parseISO(conference.startDate);
        return isAfter(startDate, now);
      } catch {
        return false; // Skip conferences with invalid dates
      }
    });
    
    // Sort by start date (nearest first)
    return upcomingConferences.sort((a, b) => {
      const dateA = parseISO(a.startDate);
      const dateB = parseISO(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error(`Error fetching conferences for ${domain}:`, error);
    return [];
  }
}

export async function getAllConferences(): Promise<Domain[]> {
  const year = await getCurrentYear();
  const domains = await getAvailableDomains(year);
  
  const domainPromises = domains.map(async (domainSlug) => {
    const conferences = await getConferencesForDomain(domainSlug, year);
    const domainInfo = DOMAIN_MAPPINGS[domainSlug] || {
      name: domainSlug.charAt(0).toUpperCase() + domainSlug.slice(1),
      description: `Conferences related to ${domainSlug}`
    };
    
    return {
      slug: domainSlug,
      name: domainInfo.name,
      description: domainInfo.description,
      conferences
    };
  });
  
  const results = await Promise.all(domainPromises);
  
  // Filter out domains with no upcoming conferences
  return results.filter(domain => domain.conferences.length > 0);
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (start.getTime() === end.getTime()) {
      return formatDate(startDate);
    }
    
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

export function getLocationText(conference: Conference): string {
  if (conference.online) {
    return 'Online';
  }
  
  if (conference.city && conference.country) {
    return `${conference.city}, ${conference.country}`;
  }
  
  return conference.city || conference.country || 'Location TBD';
} 