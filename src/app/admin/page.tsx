'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScrapeLog } from '@/types/conference';

export default function AdminPage() {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{
    success: boolean;
    message?: string;
    data?: {
      github: { found: number; added: number; updated: number };
      scraped: { found: number; added: number; updated: number };
      totalProcessingTime: number;
    };
  } | null>(null);
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLog[]>([]);
  const [stats, setStats] = useState<{
    totalConferences: number;
    newConferences: number;
    domains: number;
    latestScrapeLogs: ScrapeLog[];
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/scrape');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setScrapeLogs(data.data.latestScrapeLogs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const triggerScrape = async () => {
    setIsScraping(true);
    setScrapeResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setScrapeResult(result);

      if (result.success) {
        // Refresh data
        await fetchData();
      }
    } catch (error) {
      console.error('Error triggering scrape:', error);
      setScrapeResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsScraping(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
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
                Admin Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conferences</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConferences}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">New Conferences</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.newConferences}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Domains</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.domains}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                {stats.latestScrapeLogs?.[0]?.completedAt 
                  ? formatDate(stats.latestScrapeLogs[0].completedAt)
                  : 'Never'
                }
              </p>
            </div>
          </div>
        )}

        {/* Manual Scrape Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Manual Scraping
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Trigger a manual scraping process to fetch the latest conferences from GitHub and web sources.
          </p>
          <button
            onClick={triggerScrape}
            disabled={isScraping}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isScraping ? 'Scraping...' : 'Start Scraping'}
          </button>

          {scrapeResult && (
            <div className={`mt-4 p-4 rounded-md ${
              scrapeResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <h3 className={`font-medium ${
                scrapeResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {scrapeResult.success ? 'Scraping Completed' : 'Scraping Failed'}
              </h3>
              <p className={`text-sm mt-1 ${
                scrapeResult.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {scrapeResult.message}
              </p>
              {scrapeResult.data && (
                <div className="mt-2 text-sm">
                  <p>GitHub: {scrapeResult.data.github.added} added, {scrapeResult.data.github.updated} updated</p>
                  <p>Scraped: {scrapeResult.data.scraped.added} added, {scrapeResult.data.scraped.updated} updated</p>
                  <p>Processing time: {Math.round(scrapeResult.data.totalProcessingTime / 1000)}s</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrape Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Scrape Logs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {scrapeLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.scrapeType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.conferencesFound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.conferencesAdded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.conferencesUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.completedAt ? formatDate(log.completedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 