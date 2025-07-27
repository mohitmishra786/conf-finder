'use client';

import { useState } from 'react';
import { Domain } from '@/types/conference';
import ConferenceCard from './ConferenceCard';
import Link from 'next/link';

interface DomainSectionProps {
  domain: Domain;
  searchTerm?: string;
  conferencesPerPage?: number;
}

export default function DomainSection({ 
  domain, 
  searchTerm, 
  conferencesPerPage = 10 
}: DomainSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter conferences to only show those that belong to this domain
  const domainConferences = domain.conferences.filter(conference => {
    // If there's a search term, check if it matches
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        conference.name.toLowerCase().includes(searchLower) ||
        conference.city.toLowerCase().includes(searchLower) ||
        conference.country.toLowerCase().includes(searchLower) ||
        (conference.description && conference.description.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(domainConferences.length / conferencesPerPage);
  const startIndex = (currentPage - 1) * conferencesPerPage;
  const endIndex = startIndex + conferencesPerPage;
  const displayedConferences = domainConferences.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (domainConferences.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      {/* Domain Header */}
              <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {domain.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {domain.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/search?domain=${domain.slug}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View all ({domainConferences.length})
            </Link>
          </div>
        </div>

      {/* Conferences Grid */}
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {displayedConferences.map((conference, index) => (
              <ConferenceCard
                key={`${conference.name}-${index}`}
                conference={conference}
                searchTerm={searchTerm}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              {/* Show limited page numbers */}
              {(() => {
                const numbers = [];
                const maxVisible = 5;
                
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) {
                    numbers.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                      numbers.push(i);
                    }
                    numbers.push('...');
                    numbers.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    numbers.push(1);
                    numbers.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      numbers.push(i);
                    }
                  } else {
                    numbers.push(1);
                    numbers.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      numbers.push(i);
                    }
                    numbers.push('...');
                    numbers.push(totalPages);
                  }
                }
                
                return numbers.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
} 