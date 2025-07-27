import Link from 'next/link';
import { GITHUB_REPO_URL } from '@/constants/domains';

export default function AboutPage() {
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
                About
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Tech Conferences Directory
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              A comprehensive directory of upcoming tech conferences across various domains including 
              Artificial Intelligence, Cloud Computing, DevOps, Web Development, and many more.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Source
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All conference data is sourced from the{' '}
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                confs.tech GitHub repository
              </a>
              , which is an open-source project that aggregates conference information from various sources.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How It Works
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Data is automatically fetched from GitHub at build time and runtime</li>
              <li>Conferences are filtered to show only upcoming events</li>
              <li>The site updates twice daily using Incremental Static Regeneration (ISR)</li>
              <li>Search functionality allows you to find conferences by name, location, or domain</li>
              <li>Each domain has its own dedicated page with pagination</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Features
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Real-time search across all conferences and domains</li>
              <li>Responsive design that works on all devices</li>
              <li>Dark mode support</li>
              <li>Conference details including dates, location, CFP status, and social links</li>
              <li>Automatic filtering of past conferences</li>
              <li>Pagination for better performance with large datasets</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Technology Stack
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Next.js 15+ with App Router</li>
              <li>TypeScript for type safety</li>
              <li>Tailwind CSS for styling</li>
              <li>Fuse.js for fuzzy search functionality</li>
              <li>date-fns for date manipulation</li>
              <li>GitHub API for data fetching</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contributing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This project is open source and contributions are welcome! You can:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Add new domain mappings and descriptions</li>
              <li>Improve the search functionality</li>
              <li>Enhance the UI/UX design</li>
              <li>Add new features like conference reminders or calendar integration</li>
              <li>Report bugs or suggest improvements</li>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Conferences
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 