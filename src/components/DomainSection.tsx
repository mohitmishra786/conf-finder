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

  const totalPages = Math.ceil(domain.conferences.length / conferencesPerPage);
  const startIndex = (currentPage - 1) * conferencesPerPage;
  const endIndex = startIndex + conferencesPerPage;
  const displayedConferences = domain.conferences.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (domain.conferences.length === 0) {
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
        <Link
          href={`/domains/${domain.slug}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          View all ({domain.conferences.length})
        </Link>
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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
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