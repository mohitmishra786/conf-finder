import { notFound } from 'next/navigation';
import { getConferencesForDomain, getCurrentYear } from '@/lib/conferences';
import { DOMAIN_MAPPINGS } from '@/constants/domains';
import ConferenceCard from '@/components/ConferenceCard';
import Link from 'next/link';

interface DomainPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function DomainPage({ params, searchParams }: DomainPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');
  const conferencesPerPage = 12;

  const year = await getCurrentYear();
  const conferences = await getConferencesForDomain(slug, year);

  if (conferences.length === 0) {
    notFound();
  }

  const domainInfo = DOMAIN_MAPPINGS[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Conferences related to ${slug}`
  };

  const totalPages = Math.ceil(conferences.length / conferencesPerPage);
  const startIndex = (page - 1) * conferencesPerPage;
  const endIndex = startIndex + conferencesPerPage;
  const displayedConferences = conferences.slice(startIndex, endIndex);

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
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {domainInfo.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {conferences.length} upcoming conferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain Description */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {domainInfo.description}
          </p>
        </div>

        {/* Conferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedConferences.map((conference, index) => (
            <ConferenceCard
              key={`${conference.name}-${index}`}
              conference={conference}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Link
              href={`/domains/${slug}?page=${page - 1}`}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </Link>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/domains/${slug}?page=${pageNum}`}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </Link>
            ))}
            
            <Link
              href={`/domains/${slug}?page=${page + 1}`}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 