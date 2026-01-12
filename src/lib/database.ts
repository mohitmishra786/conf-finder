import { supabaseAdmin, supabase } from './supabase';
import { Conference, Domain, ScrapeLog } from '@/types/conference';

// Convert database row to Conference interface
function mapConferenceRow(row: Record<string, unknown>): Conference {
  return {
    id: row.id as number,
    name: row.name as string,
    url: row.url as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    city: (row.city as string) || '',
    country: (row.country as string) || '',
    online: row.online as boolean,
    cfp: row.cfp_until ? {
      until: row.cfp_until as string,
      url: (row.cfp_url as string) || ''
    } : undefined,
    twitter: (row.twitter as string) || undefined,
    description: (row.description as string) || undefined,
    source: row.source as 'github' | 'scraped',
    scrapedAt: (row.scraped_at as string) || undefined,
    isNew: row.is_new as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

// Convert database row to Domain interface
function mapDomainRow(row: Record<string, unknown>): Domain {
  return {
    id: row.id as number,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    conferences: []
  };
}

// Convert Conference interface to database insert format
function mapConferenceToInsert(conference: Conference, domainSlug: string): Record<string, unknown> {
  return {
    domain_slug: domainSlug,
    name: conference.name,
    url: conference.url,
    start_date: conference.startDate,
    end_date: conference.endDate,
    city: conference.city || null,
    country: conference.country || null,
    online: conference.online,
    cfp_until: conference.cfp?.until || null,
    cfp_url: conference.cfp?.url || null,
    twitter: conference.twitter || null,
    description: conference.description || null,
    source: conference.source || 'github',
    scraped_at: conference.scrapedAt || null,
    is_new: conference.isNew || false
  };
}

// Database operations
export async function getAllDomainsWithConferences(): Promise<Domain[]> {
  try {
    // Get all domains
    const { data: domains, error: domainsError } = await supabase
      .from('domains')
      .select('*')
      .order('name');

    if (domainsError) throw domainsError;

    // Get all upcoming conferences (try the view first, fallback to direct table)
    let conferences: Record<string, unknown>[] = [];
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('conferences_with_domains')
        .select('*')
        .order('start_date');

      if (!viewError && viewData) {
        conferences = viewData;
      }
    } catch {
      // If view doesn't exist or fails, try direct table query
      const { data: tableData, error: tableError } = await supabase
        .from('conferences')
        .select('*')
        .order('start_date');

      if (!tableError && tableData) {
        conferences = tableData;
      }
    }

    // Group conferences by domain
    const domainMap = new Map<string, Domain>();

    domains?.forEach(domain => {
      domainMap.set(domain.slug, mapDomainRow(domain));
    });

    console.log(`Total conferences found: ${conferences?.length || 0}`);
    console.log(`Available domains: ${Array.from(domainMap.keys()).join(', ')}`);

    conferences?.forEach(conference => {
      const domainSlug = conference.domain_slug as string;
      const domain = domainMap.get(domainSlug);
      if (domain) {
        domain.conferences.push(mapConferenceRow(conference));
        console.log(`Added conference "${conference.name}" to domain "${domainSlug}"`);
      } else {
        console.warn(`Conference "${conference.name}" has unknown domain_slug: ${domainSlug}`);
        // Add to a default domain if no match found
        const defaultDomain = domainMap.get('web');
        if (defaultDomain) {
          defaultDomain.conferences.push(mapConferenceRow(conference));
          console.log(`Added conference "${conference.name}" to default domain "web"`);
        }
      }
    });

    return Array.from(domainMap.values());
  } catch (error) {
    console.error('Error fetching domains with conferences:', error);
    throw error;
  }
}

export async function getConferencesByDomain(domainSlug: string): Promise<Conference[]> {
  try {
    const { data, error } = await supabase
      .from('conferences')
      .select('*')
      .eq('domain_slug', domainSlug)
      .order('start_date');

    if (error) throw error;

    return data?.map(mapConferenceRow) || [];
  } catch (error) {
    console.error(`Error fetching conferences for domain ${domainSlug}:`, error);
    throw error;
  }
}

export async function upsertConferences(conferences: Conference[], domainSlug: string): Promise<{ added: number; updated: number }> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    throw new Error('Supabase admin client not available - this function requires server-side execution');
  }

  console.log(`Upserting ${conferences.length} conferences for domain: ${domainSlug}`);

  try {
    let added = 0;
    let updated = 0;

    for (const conference of conferences) {
      const insertData = mapConferenceToInsert(conference, domainSlug);
      console.log('Insert data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabaseAdmin
        .from('conferences')
        .upsert(insertData, {
          onConflict: 'name,url,start_date',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('Error upserting conference:', error);
        continue;
      }

      console.log('Upsert result:', data);

      if (data && data.length > 0) {
        // Check if this was an insert or update
        const existing = data[0];
        if (existing.created_at === existing.updated_at) {
          added++;
        } else {
          updated++;
        }
      }
    }

    console.log(`Upsert completed: ${added} added, ${updated} updated`);
    return { added, updated };
  } catch (error) {
    console.error('Error upserting conferences:', error);
    throw error;
  }
}

export async function createScrapeLog(log: Omit<ScrapeLog, 'id'>): Promise<ScrapeLog> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available - this function requires server-side execution');
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('scrape_logs')
      .insert({
        scrape_type: log.scrapeType,
        status: log.status,
        conferences_found: log.conferencesFound,
        conferences_added: log.conferencesAdded,
        conferences_updated: log.conferencesUpdated,
        error_message: log.errorMessage || null,
        started_at: log.startedAt,
        completed_at: log.completedAt || null,
        metadata: log.metadata || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      scrapeType: data.scrape_type as 'github' | 'apify',
      status: data.status as 'success' | 'error' | 'partial',
      conferencesFound: data.conferences_found,
      conferencesAdded: data.conferences_added,
      conferencesUpdated: data.conferences_updated,
      errorMessage: data.error_message || undefined,
      startedAt: data.started_at,
      completedAt: data.completed_at || undefined,
      metadata: data.metadata || undefined
    };
  } catch (error) {
    console.error('Error creating scrape log:', error);
    throw error;
  }
}

export async function updateScrapeLog(id: number, updates: Partial<ScrapeLog>): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available - this function requires server-side execution');
  }

  try {
    const { error } = await supabaseAdmin
      .from('scrape_logs')
      .update({
        status: updates.status || undefined,
        conferences_found: updates.conferencesFound || undefined,
        conferences_added: updates.conferencesAdded || undefined,
        conferences_updated: updates.conferencesUpdated || undefined,
        error_message: updates.errorMessage || undefined,
        completed_at: updates.completedAt || undefined,
        metadata: updates.metadata || undefined
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating scrape log:', error);
    throw error;
  }
}

export async function getLatestScrapeLogs(limit: number = 10): Promise<ScrapeLog[]> {
  try {
    const { data, error } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(log => ({
      id: log.id,
      scrapeType: log.scrape_type as 'github' | 'apify',
      status: log.status as 'success' | 'error' | 'partial',
      conferencesFound: log.conferences_found,
      conferencesAdded: log.conferences_added,
      conferencesUpdated: log.conferences_updated,
      errorMessage: log.error_message || undefined,
      startedAt: log.started_at,
      completedAt: log.completed_at || undefined,
      metadata: log.metadata || undefined
    })) || [];
  } catch (error) {
    console.error('Error fetching scrape logs:', error);
    throw error;
  }
}

export async function getLastUpdatedTimestamp(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('scrape_logs')
      .select('completed_at')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return data?.completed_at || null;
  } catch (error) {
    console.error('Error fetching last updated timestamp:', error);
    return null;
  }
}

export async function searchConferences(searchTerm: string): Promise<Conference[]> {
  try {
    // Sanitize search term to prevent SQL injection
    const sanitizedTerm = searchTerm.replace(/[%_]/g, '\\$&');

    const { data, error } = await supabase
      .from('conferences_with_domains')
      .select('*')
      .or(`name.ilike.%${sanitizedTerm}%,city.ilike.%${sanitizedTerm}%,country.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%`)
      .order('start_date');

    if (error) throw error;

    return data?.map(mapConferenceRow) || [];
  } catch (error) {
    console.error('Error searching conferences:', error);
    throw error;
  }
} 