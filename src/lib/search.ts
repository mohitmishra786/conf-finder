import Fuse from 'fuse.js';
import { Domain, SearchResult } from '@/types/conference';

export function searchConferences(
  domains: Domain[],
  searchTerm: string
): SearchResult[] {
  if (!searchTerm.trim()) {
    return domains.map(domain => ({
      domain,
      conferences: domain.conferences
    }));
  }

  const fuseOptions = {
    keys: [
      'name',
      'city',
      'country'
    ],
    threshold: 0.3,
    includeScore: true
  };

  const results: SearchResult[] = [];

  domains.forEach(domain => {
    const fuse = new Fuse(domain.conferences, fuseOptions);
    const searchResults = fuse.search(searchTerm);
    
    const matchedConferences = searchResults
      .filter(result => result.score && result.score < 0.5)
      .map(result => result.item);

    if (matchedConferences.length > 0) {
      results.push({
        domain,
        conferences: matchedConferences
      });
    }
  });

  return results;
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
} 