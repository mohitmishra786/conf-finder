'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Domain, Conference } from '@/types/conference';
import { searchConferences } from '@/lib/search';
import { getAllDomainsWithConferences } from '@/lib/database';
import Header from '@/components/Header';
import ConferenceCard from '@/components/ConferenceCard';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const conferencesPerPage = 12;
  
  // Filter state
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get initial search term from URL
  const initialSearchTerm = searchParams.get('q') || '';
  const initialDomain = searchParams.get('domain') || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setSelectedDomain(initialDomain);
    setCurrentPage(initialPage);
  }, [initialSearchTerm, initialDomain, initialPage]);

  // Separate useEffect for loading data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading data...');
      // Load domains for filter dropdown
      const response = await fetch('/api/conferences');
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conferences: ${response.status}`);
      }
      
      const domainsData = await response.json();
      console.log('Domains data loaded:', domainsData.length, 'domains');
      setDomains(domainsData);
      
      // Perform search
      await performSearch();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load conference data');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      console.log('Performing search with:', { searchTerm, selectedDomain, domainsCount: domains.length });
      
      let searchResults: Conference[] = [];
      
      if (searchTerm.trim()) {
        // Search across all conferences using the search function
        const searchResultsData = searchConferences(domains, searchTerm);
        searchResults = searchResultsData.flatMap(result => result.conferences);
        console.log('Search results from search function:', searchResults.length);
      } else {
        // Get all conferences from all domains
        searchResults = domains.flatMap(domain => domain.conferences);
        console.log('All conferences from all domains:', searchResults.length);
      }
      
      // Filter by domain if selected
      if (selectedDomain !== 'all') {
        console.log('Filtering by domain:', selectedDomain);
        // Get conferences only from the selected domain
        const selectedDomainData = domains.find(d => d.slug === selectedDomain);
        if (selectedDomainData) {
          console.log('Found domain data:', selectedDomainData.name, 'with', selectedDomainData.conferences.length, 'conferences');
          if (searchTerm.trim()) {
            // If there's a search term, filter the selected domain's conferences
            searchResults = selectedDomainData.conferences.filter(conference => {
              const searchLower = searchTerm.toLowerCase();
              return (
                conference.name.toLowerCase().includes(searchLower) ||
                conference.city.toLowerCase().includes(searchLower) ||
                conference.country.toLowerCase().includes(searchLower) ||
                (conference.description && conference.description.toLowerCase().includes(searchLower))
              );
            });
          } else {
            // If no search term, use all conferences from the selected domain
            searchResults = selectedDomainData.conferences;
          }
        } else {
          console.log('Domain not found:', selectedDomain);
          searchResults = [];
        }
      }
      
      console.log('Final search results:', searchResults.length);
      setConferences(searchResults);
      setTotalPages(Math.ceil(searchResults.length / conferencesPerPage));
      
      // Update URL
      updateURL();
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Failed to perform search');
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedDomain !== 'all') params.set('domain', selectedDomain);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(newURL, { scroll: false });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current page conferences
  const startIndex = (currentPage - 1) * conferencesPerPage;
  const endIndex = startIndex + conferencesPerPage;
  const currentConferences = conferences.slice(startIndex, endIndex);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const numbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        numbers.push(1);
        numbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          numbers.push(i);
        }
      } else {
        numbers.push(1);
        numbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(totalPages);
      }
    }
    
    return numbers;
  };

  // Update URL when search or filters change
  useEffect(() => {
    updateURL();
  }, [searchTerm, selectedDomain, currentPage]);

  // Perform search when search term or domain changes
  useEffect(() => {
    if (!loading && domains.length > 0) {
      setCurrentPage(1); // Reset to page 1 when search or domain changes
      performSearch();
    }
  }, [searchTerm, selectedDomain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={handleSearch} searchTerm={searchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} searchTerm={searchTerm} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label htmlFor="domain-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Domain
              </label>
              <select
                id="domain-filter"
                value={selectedDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="block w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain.slug} value={domain.slug}>
                    {domain.name} ({domain.conferences.length})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {conferences.length} conference{conferences.length !== 1 ? 's' : ''} found
              {selectedDomain !== 'all' && (
                <span> in {domains.find(d => d.slug === selectedDomain)?.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Conferences Grid */}
        {currentConferences.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentConferences.map((conference, index) => (
                <ConferenceCard
                  key={`${conference.name}-${index}`}
                  conference={conference}
                  searchTerm={searchTerm}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                {getPaginationNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchTerm || selectedDomain !== 'all' 
                ? 'No conferences found matching your criteria.'
                : 'No conferences available.'
              }
            </div>
            {(searchTerm || selectedDomain !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomain('all');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 