'use client';

import { useState, useEffect } from 'react';
import { Domain } from '@/types/conference';
import { getAllConferences } from '@/lib/conferences';
import { searchConferences } from '@/lib/search';
import Header from '@/components/Header';
import DomainSection from '@/components/DomainSection';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Domain[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllConferences();
        setDomains(data);
        setError(null);
      } catch (err) {
        setError('Failed to load conferences. Please try refreshing the page.');
        console.error('Error fetching conferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchConferences(domains, searchTerm);
      setSearchResults(results.map(result => ({
        ...result.domain,
        conferences: result.conferences
      })));
    } else {
      setSearchResults(domains);
    }
  }, [searchTerm, domains]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={handleSearch} searchTerm={searchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 text-lg mb-4">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} searchTerm={searchTerm} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Summary */}
        {searchTerm && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              Found {searchResults.reduce((total, domain) => total + domain.conferences.length, 0)} conferences 
              across {searchResults.length} domains for &quot;{searchTerm}&quot;
            </p>
          </div>
        )}

        {/* Domains */}
        {searchResults.length > 0 ? (
          searchResults.map((domain) => (
            <DomainSection
              key={domain.slug}
              domain={domain}
              searchTerm={searchTerm}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchTerm ? 'No conferences found matching your search.' : 'No upcoming conferences found.'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
