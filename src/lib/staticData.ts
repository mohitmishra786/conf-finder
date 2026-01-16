/**
 * Static Data Loader for conf-finder v2.0
 *
 * Loads conference data from static JSON file at build time.
 * Provides utilities for filtering, sorting, and searching conferences.
 */

import {
    Conference,
    ConferenceData,
    ConferenceFilters,
    Domain,
    SortOption
} from '@/types/conference';

// Import static JSON data - Next.js will inline this at build time
import rawData from '../../public/data/conferences.json';

// Type assertion for the imported data
const conferenceData = rawData as ConferenceData;

/**
 * Get all conference data including stats and domains
 */
export function getConferenceData(): ConferenceData {
    return conferenceData;
}

/**
 * Get all conferences
 */
export function getAllConferences(): Conference[] {
    return conferenceData.conferences;
}

/**
 * Get all domains
 */
export function getAllDomains(): Domain[] {
    return conferenceData.domains;
}

/**
 * Get conferences grouped by domain
 */
export function getConferencesByDomain(): Map<string, Conference[]> {
    const grouped = new Map<string, Conference[]>();

    for (const conf of conferenceData.conferences) {
        const domain = conf.domain;
        if (!grouped.has(domain)) {
            grouped.set(domain, []);
        }
        grouped.get(domain)!.push(conf);
    }

    return grouped;
}

/**
 * Calculate CFP days remaining (recalculates based on current date)
 */
export function calculateCfpDaysRemaining(cfpEndDate: string): number {
    const deadline = new Date(cfpEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Check if CFP is still open (recalculates based on current date)
 */
export function isCfpOpen(cfpEndDate: string): boolean {
    return calculateCfpDaysRemaining(cfpEndDate) > 0;
}

/**
 * Get CFP urgency level for styling
 */
export function getCfpUrgency(daysRemaining: number): 'critical' | 'urgent' | 'soon' | 'open' | 'closed' {
    if (daysRemaining <= 0) return 'closed';
    if (daysRemaining <= 3) return 'critical';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 14) return 'soon';
    return 'open';
}

/**
 * Get CSS classes for CFP urgency badge
 */
export function getCfpBadgeClasses(urgency: ReturnType<typeof getCfpUrgency>): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (urgency) {
        case 'critical':
            return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
        case 'urgent':
            return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
        case 'soon':
            return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
        case 'open':
            return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case 'closed':
        default:
            return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400`;
    }
}

/**
 * Format CFP badge text
 */
export function formatCfpBadgeText(daysRemaining: number): string {
    if (daysRemaining <= 0) return 'CFP Closed';
    if (daysRemaining === 1) return 'CFP: 1 day left!';
    if (daysRemaining <= 3) return `CFP: ${daysRemaining} days left!`;
    if (daysRemaining <= 7) return `CFP: ${daysRemaining} days left`;
    return 'CFP Open';
}

/**
 * Filter conferences based on provided filters
 */
export function filterConferences(
    conferences: Conference[],
    filters: ConferenceFilters
): Conference[] {
    let filtered = [...conferences];

    // Filter by domain
    if (filters.domain && filters.domain !== 'all') {
        filtered = filtered.filter(c => c.domain === filters.domain);
    }

    // Filter by CFP open
    if (filters.cfpOpen) {
        filtered = filtered.filter(c => c.cfp && isCfpOpen(c.cfp.endDate));
    }

    // Filter by financial aid
    if (filters.hasFinancialAid) {
        filtered = filtered.filter(c => c.financialAid?.available);
    }

    // Filter by continent
    if (filters.continent && filters.continent !== 'all') {
        filtered = filtered.filter(c => c.continent === filters.continent);
    }

    // Filter by online
    if (filters.online !== undefined) {
        filtered = filtered.filter(c => c.online === filters.online);
    }

    // Filter by search term
    if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.toLowerCase().trim();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.city.toLowerCase().includes(term) ||
            c.country.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term) ||
            c.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }

    return filtered;
}

/**
 * Sort conferences by specified option
 */
export function sortConferences(
    conferences: Conference[],
    sortBy: SortOption = 'startDate'
): Conference[] {
    const sorted = [...conferences];

    switch (sortBy) {
        case 'cfpDeadline':
            // Sort by CFP deadline (soonest first), conferences without CFP at end
            return sorted.sort((a, b) => {
                if (!a.cfp && !b.cfp) return 0;
                if (!a.cfp) return 1;
                if (!b.cfp) return -1;
                return a.cfp.endDate.localeCompare(b.cfp.endDate);
            });

        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));

        case 'startDate':
        default:
            return sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
}

/**
 * Get unique continents from conferences
 */
export function getUniqueContinents(): string[] {
    const continents = new Set<string>();
    for (const conf of conferenceData.conferences) {
        if (conf.continent) {
            continents.add(conf.continent);
        }
    }
    return Array.from(continents).sort();
}

/**
 * Format date for display
 */
export function formatConferenceDate(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric'
    };

    const startStr = start.toLocaleDateString('en-US', options);

    if (startDate === endDate) {
        return `${startStr}, ${start.getFullYear()}`;
    }

    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${startStr}-${end.getDate()}, ${start.getFullYear()}`;
    }

    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}, ${end.getFullYear()}`;
}

/**
 * Get domain by slug
 */
export function getDomainBySlug(slug: string): Domain | undefined {
    return conferenceData.domains.find(d => d.slug === slug);
}
