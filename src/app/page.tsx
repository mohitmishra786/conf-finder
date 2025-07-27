import { Domain } from '@/types/conference';
import { getAllDomainsWithConferences } from '@/lib/database';
import Header from '@/components/Header';
import DomainSection from '@/components/DomainSection';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default async function Home() {
  let domains: Domain[] = [];
  let error: string | null = null;

  try {
    domains = await getAllDomainsWithConferences();
    
    if (domains.length === 0) {
      error = 'No conference data found. Please set up the database or run the initial data fetch.';
    }
  } catch (err) {
    console.error('Error fetching conferences:', err);
    error = 'Database not set up yet. Please run the database setup SQL and trigger the initial data fetch.';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 text-lg mb-4">
              {error}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              <p className="mb-4">To get started:</p>
              <ol className="text-left list-decimal list-inside space-y-2">
                <li>Run the database setup SQL in your Supabase SQL Editor</li>
                <li>Visit the <a href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">Admin Panel</a> to trigger the initial data fetch</li>
                <li>Or click "Try Again" to reload the page</li>
              </ol>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/admin"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors inline-block"
              >
                Go to Admin Panel
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showSearchRedirect={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain Filter Buttons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Domain
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/search"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              All Conferences
            </a>
            {domains.map((domain) => (
              <a
                key={domain.slug}
                href={`/search?domain=${domain.slug}`}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {domain.name} ({domain.conferences.length})
              </a>
            ))}
          </div>
        </div>

        {/* Domains */}
        {domains.length > 0 ? (
          domains.map((domain) => (
            <DomainSection
              key={domain.slug}
              domain={domain}
              searchTerm=""
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No upcoming conferences found.
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
