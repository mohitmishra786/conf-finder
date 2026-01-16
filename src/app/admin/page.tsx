'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConferenceData } from '@/types/conference';

export default function AdminPage() {
  const [data, setData] = useState<ConferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/conferences');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Data Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
            {error}
          </div>
        ) : data ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conferences</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.totalConferences}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Open CFPs</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.stats.openCfps}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">With Financial Aid</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.stats.withFinancialAid}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.domains.length}</p>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Source Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(data.lastUpdated)}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Source:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{data.source}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Data Version:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{data.version}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Data is automatically updated daily via GitHub Actions.
                  To manually trigger an update, go to the repository&apos;s Actions tab and run the &quot;Update Conference Data&quot; workflow.
                </p>
              </div>
            </div>

            {/* Domains Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories Overview
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Conferences
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.domains.map((domain) => (
                      <tr key={domain.slug}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: domain.color }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {domain.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {domain.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {domain.conferenceCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/search?domain=${domain.slug}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Continent Distribution */}
            {data.stats.byContinent && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Geographic Distribution
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data.stats.byContinent)
                    .sort(([, a], [, b]) => b - a)
                    .map(([continent, count]) => (
                      <div key={continent} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{continent}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{count}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}