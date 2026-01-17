'use client';

/**
 * Confab Homepage
 * 
 * Features:
 * - World map visualization of conferences
 * - Month-grouped timeline view
 * - Speaker Mode toggle (highlights open CFPs)
 * - Domain and filter controls
 */

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Conference, ConferenceData, DOMAIN_INFO } from '@/types/conference';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TimelineView from '@/components/TimelineView';
import ConferenceCard from '@/components/ConferenceCard';

// Dynamic import for WorldMap (requires browser APIs)
const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const [data, setData] = useState<ConferenceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // View and filter state
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [speakerMode, setSpeakerMode] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/conferences.json');
        if (!response.ok) throw new Error('Failed to fetch conferences');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching conferences:', err);
        setError('Failed to load conference data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Flatten conferences for filtering
  const allConferences = useMemo(() => {
    if (!data?.months) return [];
    return Object.values(data.months).flat();
  }, [data]);

  // Filtered conferences
  const filteredConferences = useMemo(() => {
    let confs = [...allConferences];

    // Domain filter
    if (selectedDomain !== 'all') {
      confs = confs.filter(c => c.domain === selectedDomain);
    }

    // Speaker mode (open CFPs only)
    if (speakerMode) {
      confs = confs.filter(c => c.cfp?.status === 'open');
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      confs = confs.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.location?.raw?.toLowerCase().includes(term) ||
        c.tags?.some(t => t.toLowerCase().includes(term))
      );
    }

    return confs;
  }, [allConferences, selectedDomain, speakerMode, searchTerm]);

  // Regroup filtered conferences by month
  const filteredMonths = useMemo(() => {
    const grouped: Record<string, Conference[]> = {};

    for (const conf of filteredConferences) {
      const monthKey = conf.startDate
        ? new Date(conf.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'TBD';

      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(conf);
    }

    // Sort by date within each month
    for (const confs of Object.values(grouped)) {
      confs.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
    }

    return grouped;
  }, [filteredConferences]);

  // Get unique domains for filter
  const domains = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allConferences) {
      counts[c.domain] = (counts[c.domain] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({
        slug,
        count,
        ...DOMAIN_INFO[slug] || { name: slug, icon: '📌', color: '#6B7280' }
      }));
  }, [allConferences]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <main className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <section className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Tech Conferences</span>
            <br />
            <span className="text-white">Worldwide</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            {data?.stats.total.toLocaleString()} conferences from {domains.length} domains.
            <br />
            {data?.stats.withOpenCFP} open CFPs waiting for speakers.
          </p>
        </section>

        {/* Stats */}
        {data?.stats && (
          <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{data.stats.total.toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Conferences</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{data.stats.withOpenCFP}</div>
              <div className="text-xs text-zinc-500">Open CFPs</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{data.stats.withLocation.toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Mapped</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{Object.keys(data.months).length}</div>
              <div className="text-xs text-zinc-500">Months</div>
            </div>
          </section>
        )}

        {/* World Map Toggle */}
        <section className="mb-6">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`w-full card p-3 text-center transition-all ${showMap ? 'ring-2 ring-blue-500' : ''}`}
          >
            <span className="text-zinc-400">
              {showMap ? 'Hide' : 'Show'} World Map
            </span>
          </button>

          {showMap && (
            <div className="mt-4">
              <WorldMap conferences={filteredConferences} />
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="mb-6 card p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search conferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Domain */}
            <div className="w-full md:w-56">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full"
              >
                <option value="all">All Domains ({allConferences.length})</option>
                {domains.map(d => (
                  <option key={d.slug} value={d.slug}>
                    {d.name} ({d.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Speaker Mode */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speakerMode}
                  onChange={(e) => setSpeakerMode(e.target.checked)}
                  className="form-checkbox"
                />
                <span className={`text-sm ${speakerMode ? 'text-green-400 font-medium' : 'text-zinc-400'}`}>
                  Speaker Mode
                </span>
              </label>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
                >
                  Grid
                </button>
              </div>
            </div>

            <div className="text-sm text-zinc-500">
              {filteredConferences.length} result{filteredConferences.length !== 1 ? 's' : ''}
              {(selectedDomain !== 'all' || speakerMode || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setSpeakerMode(false);
                    setSearchTerm('');
                  }}
                  className="ml-4 text-blue-400 hover:text-blue-300 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Conference Display */}
        {filteredConferences.length > 0 ? (
          viewMode === 'timeline' ? (
            <TimelineView months={filteredMonths} speakerMode={speakerMode} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConferences.slice(0, 50).map((conf, idx) => (
                <ConferenceCard key={`${conf.id}-${idx}`} conference={conf} searchTerm={searchTerm} />
              ))}
              {filteredConferences.length > 50 && (
                <div className="col-span-full text-center py-4 text-zinc-500">
                  Showing 50 of {filteredConferences.length}. Use filters to narrow results.
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12 text-zinc-500">
            No conferences found matching your criteria.
          </div>
        )}

        {/* Last Updated */}
        {data?.lastUpdated && (
          <div className="mt-10 text-center text-sm text-zinc-600">
            Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
