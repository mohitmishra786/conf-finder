import { GITHUB_REPO_URL } from '@/constants/domains';

export default function Footer() {
  const lastUpdated = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p className="mb-2">
            Data fetched from{' '}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              confs.tech GitHub repository
            </a>
            .
          </p>
          <p>
            Last updated: {lastUpdated}. Data as of July 2025 onwards.
          </p>
        </div>
      </div>
    </footer>
  );
} 