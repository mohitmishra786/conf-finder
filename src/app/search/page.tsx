'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Conference, Domain, ConferenceData, SortOption } from '@/types/conference';

import Header from '@/components/Header';
import ConferenceCard from '@/components/ConferenceCard';
import Footer from '@/components/Footer';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<ConferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state from URL params
  const initialSearchTerm = searchParams.get('q') || '';
  const initialDomain = searchParams.get('domain') || 'all';
  const initialCfpOnly = searchParams.get('cfp') === 'true';
  const initialFinancialAid = searchParams.get('aid') === 'true';

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [showCfpOnly, setShowCfpOnly] = useState(initialCfpOnly);
  const [showFinancialAidOnly, setShowFinancialAidOnly] = useState(initialFinancialAid);
  const [sortBy, setSortBy] = useState<SortOption>('startDate');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const conferencesPerPage = 12;

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
        console.error('Error loading data:', err);
        setError('Failed to load conference data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedDomain !== 'all') params.set('domain', selectedDomain);
    if (showCfpOnly) params.set('cfp', 'true');
    if (showFinancialAidOnly) params.set('aid', 'true');

    const newURL = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newURL, { scroll: false });
  }, [searchTerm, selectedDomain, showCfpOnly, showFinancialAidOnly, router]);

  // Filter and sort conferences
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

    // Sort
    switch (sortBy) {
      case 'cfpDeadline':
        conferences.sort((a, b) => {
          if (!a.cfp && !b.cfp) return 0;
          if (!a.cfp) return 1;
          if (!b.cfp) return -1;
          return a.cfp.endDate.localeCompare(b.cfp.endDate);
        });
        break;
      case 'name':
        conferences.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'startDate':
      default:
        conferences.sort((a, b) => a.startDate.localeCompare(b.startDate));
        break;
    }

    return conferences;
  }, [data, selectedDomain, showCfpOnly, showFinancialAidOnly, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredConferences.length / conferencesPerPage);
  const startIndex = (currentPage - 1) * conferencesPerPage;
  const currentConferences = filteredConferences.slice(startIndex, startIndex + conferencesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDomain, showCfpOnly, showFinancialAidOnly, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400">Loading conferences...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {showCfpOnly ? (
              <>Open <span className="gradient-text">Call for Papers</span></>
            ) : (
              <>Search <span className="gradient-text">Conferences</span></>
            )}
          </h1>
          <p className="text-zinc-400">
            {showCfpOnly
              ? 'Find conferences accepting talk submissions right now.'
              : 'Filter and discover tech conferences worldwide.'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 card p-6">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, city, country, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="w-full lg:w-48">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Categories</option>
                  {data?.domains.map((domain: Domain) => (
                    <option key={domain.slug} value={domain.slug}>
                      {domain.name} ({domain.conferenceCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full lg:w-40">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full"
                >
                  <option value="startDate">Sort by Date</option>
                  <option value="cfpDeadline">CFP Deadline</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Toggle Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showCfpOnly}
                    onChange={(e) => setShowCfpOnly(e.target.checked)}
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                    CFP Open Only
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showFinancialAidOnly}
                    onChange={(e) => setShowFinancialAidOnly(e.target.checked)}
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                    Financial Aid
                  </span>
                </label>
              </div>

              <div className="text-sm text-zinc-500">
                {filteredConferences.length} result{filteredConferences.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Conferences Grid */}
        {currentConferences.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentConferences.map((conference: Conference) => (
                <ConferenceCard
                  key={conference.id}
                  conference={conference}
                  searchTerm={searchTerm}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-zinc-500">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-zinc-500 text-lg mb-4">
              No conferences found matching your criteria.
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDomain('all');
                setShowCfpOnly(false);
                setShowFinancialAidOnly(false);
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}