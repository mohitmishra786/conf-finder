'use client';

import { useState, useEffect, useMemo } from 'react';
import { Conference, Domain, ConferenceData } from '@/types/conference';
import Header from '@/components/Header';
import ConferenceCard from '@/components/ConferenceCard';
import Footer from '@/components/Footer';

export default function Home() {
  const [data, setData] = useState<ConferenceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [showCfpOnly, setShowCfpOnly] = useState(false);
  const [showFinancialAidOnly, setShowFinancialAidOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/conferences');
        if (!response.ok) {
          throw new Error('Failed to fetch conferences');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching conferences:', err);
        setError('Failed to load conference data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter conferences based on current filters
  const filteredConferences = useMemo(() => {
    if (!data) return [];

    let conferences = [...data.conferences];

    // Filter by domain
    if (selectedDomain !== 'all') {
      conferences = conferences.filter(c => c.domain === selectedDomain);
    }

    // Filter by CFP open
    if (showCfpOnly) {
      conferences = conferences.filter(c => c.cfp?.isOpen);
    }

    // Filter by financial aid
    if (showFinancialAidOnly) {
      conferences = conferences.filter(c => c.financialAid?.available);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      conferences = conferences.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return conferences;
  }, [data, selectedDomain, showCfpOnly, showFinancialAidOnly, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400">Loading conferences...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
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
    <div className="min-h-screen bg-black">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Tech Conferences</span>
            <br />
            <span className="text-white">All in One Place</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Discover {data?.stats.totalConferences || 0} upcoming conferences with {data?.stats.openCfps || 0} open CFPs.
            Find your next speaking opportunity.
          </p>
        </section>

        {/* Stats Bar */}
        {data?.stats && (
          <section className="mb-6 sm:mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" aria-label="Statistics">
            <div className="card p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {data.stats.totalConferences}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Conferences</div>
            </div>
            <div className="card p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                {data.stats.openCfps}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Open CFPs</div>
            </div>
            <div className="card p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
                {data.stats.withFinancialAid}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Financial Aid</div>
            </div>
            <div className="card p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                {data.domains.length}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500">Categories</div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6 sm:mb-8 card p-4 sm:p-6" aria-label="Filter conferences">
          {/* Row 1: Search and Category */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search-input" className="sr-only">Search conferences</label>
              <input
                id="search-input"
                type="text"
                placeholder="Search conferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search conferences"
              />
            </div>

            {/* Domain Filter */}
            <div className="w-full md:w-56">
              <label htmlFor="domain-select" className="sr-only">Filter by category</label>
              <select
                id="domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {data?.domains.map((domain: Domain) => (
                  <option key={domain.slug} value={domain.slug}>
                    {domain.name} ({domain.conferenceCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Toggle Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <label className="filter-label" htmlFor="cfp-filter">
                <input
                  id="cfp-filter"
                  type="checkbox"
                  checked={showCfpOnly}
                  onChange={(e) => setShowCfpOnly(e.target.checked)}
                />
                <span className="text-sm text-zinc-400 hover:text-white transition-colors">
                  CFP Open
                </span>
              </label>

              <label className="filter-label" htmlFor="aid-filter">
                <input
                  id="aid-filter"
                  type="checkbox"
                  checked={showFinancialAidOnly}
                  onChange={(e) => setShowFinancialAidOnly(e.target.checked)}
                />
                <span className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Financial Aid
                </span>
              </label>
            </div>

            {/* Results count and clear */}
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>
                {filteredConferences.length} result{filteredConferences.length !== 1 ? 's' : ''}
              </span>
              {(selectedDomain !== 'all' || showCfpOnly || showFinancialAidOnly || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setShowCfpOnly(false);
                    setShowFinancialAidOnly(false);
                    setSearchTerm('');
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Conference Grid */}
        {filteredConferences.length > 0 ? (
          <section aria-label="Conference list">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredConferences.map((conference: Conference) => (
                <ConferenceCard
                  key={conference.id}
                  conference={conference}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-zinc-500 text-lg mb-4">
              No conferences found matching your criteria.
            </div>
            <button
              onClick={() => {
                setSelectedDomain('all');
                setShowCfpOnly(false);
                setShowFinancialAidOnly(false);
                setSearchTerm('');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Last updated */}
        {data?.lastUpdated && (
          <div className="mt-10 sm:mt-12 text-center text-sm text-zinc-600">
            Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
