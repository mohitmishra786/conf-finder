import { Conference } from '@/types/conference';
import { formatDateRange, getLocationText } from '@/lib/conferences';
import { parseISO, isAfter } from 'date-fns';

interface ConferenceCardProps {
  conference: Conference;
  searchTerm?: string;
}

export default function ConferenceCard({ conference, searchTerm }: ConferenceCardProps) {
  const isCfpOpen = conference.cfp && isAfter(parseISO(conference.cfp.until), new Date());
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Conference Name */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            <a
              href={conference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              dangerouslySetInnerHTML={{
                __html: searchTerm 
                  ? searchTerm.replace(new RegExp(`(${searchTerm})`, 'gi'), '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
                  : conference.name
              }}
            />
          </h3>
          {conference.isNew && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
              New
            </span>
          )}
        </div>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateRange(conference.startDate, conference.endDate)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {conference.online && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                Online
              </span>
            )}
            {getLocationText(conference)}
          </div>
        </div>

        {/* CFP Status */}
        {conference.cfp && (
          <div className="mb-4">
            {isCfpOpen ? (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  CFP Open
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  until {formatDateRange(conference.cfp.until, conference.cfp.until)}
                </span>
                <a
                  href={conference.cfp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Submit →
                </a>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  CFP Closed
                </span>
              </div>
            )}
          </div>
        )}

        {/* Twitter */}
        {conference.twitter && (
          <div className="flex items-center">
            <a
              href={`https://twitter.com/${conference.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              {conference.twitter}
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 