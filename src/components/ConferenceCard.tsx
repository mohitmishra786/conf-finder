'use client';

import { Conference } from '@/types/conference';
import { formatDateRange, getLocationText } from '@/lib/conferences';
import {
  calculateCfpDaysRemaining,
  isCfpOpen,
  getCfpUrgency,
} from '@/lib/staticData';

interface ConferenceCardProps {
  conference: Conference;
  searchTerm?: string;
}

export default function ConferenceCard({ conference, searchTerm }: ConferenceCardProps) {
  // Recalculate CFP status based on current date
  const cfpDaysRemaining = conference.cfp
    ? calculateCfpDaysRemaining(conference.cfp.endDate)
    : -1;
  const cfpIsOpen = conference.cfp ? isCfpOpen(conference.cfp.endDate) : false;
  const cfpUrgency = getCfpUrgency(cfpDaysRemaining);

  // Highlight search term in text
  const highlightText = (text: string): string => {
    if (!searchTerm || !text) return text;
    try {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-blue-500/30 text-blue-300 rounded px-0.5">$1</mark>');
    } catch {
      return text;
    }
  };

  // Get badge classes based on CFP urgency
  const getCfpBadgeStyle = () => {
    switch (cfpUrgency) {
      case 'critical':
        return 'badge-red';
      case 'urgent':
        return 'badge-yellow';
      case 'soon':
      case 'open':
        return 'badge-green';
      case 'closed':
      default:
        return 'badge bg-zinc-800 text-zinc-400';
    }
  };

  // Format CFP badge text
  const getCfpText = () => {
    if (!cfpIsOpen) return 'CFP Closed';
    if (cfpDaysRemaining === 0) return 'Closes Today';
    if (cfpDaysRemaining === 1) return '1 Day Left';
    if (cfpDaysRemaining <= 7) return `${cfpDaysRemaining} Days Left`;
    return `CFP Open`;
  };

  // Get domain color
  const getDomainColor = (domain: string): string => {
    const colors: Record<string, string> = {
      ai: '#8B5CF6',
      web: '#3B82F6',
      mobile: '#10B981',
      devops: '#F59E0B',
      security: '#EF4444',
      data: '#06B6D4',
      gaming: '#EC4899',
      blockchain: '#6366F1',
      ux: '#F472B6',
      opensource: '#22C55E',
      general: '#6B7280'
    };
    return colors[domain] || '#6B7280';
  };

  return (
    <article className="card group overflow-hidden">
      {/* Domain indicator bar */}
      <div
        className="h-1"
        style={{ backgroundColor: getDomainColor(conference.domain) }}
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5">
        {/* Header with badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* CFP Badge */}
          {conference.cfp && (
            <a
              href={conference.cfp.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`badge ${getCfpBadgeStyle()} hover:opacity-80 transition-opacity cursor-pointer min-h-[2rem] flex items-center`}
              title={cfpIsOpen ? `CFP closes ${conference.cfp.endDate}` : 'CFP is closed'}
            >
              {getCfpText()}
            </a>
          )}

          {/* Financial Aid Badge */}
          {conference.financialAid?.available && (
            <span
              className="badge badge-purple min-h-[2rem] flex items-center"
              title={`Financial aid available: ${conference.financialAid.types.join(', ')}`}
            >
              Financial Aid
            </span>
          )}

          {/* Online/Hybrid Badge */}
          {conference.hybrid && (
            <span className="badge badge-blue min-h-[2rem] flex items-center">Hybrid</span>
          )}
          {conference.online && !conference.hybrid && (
            <span className="badge badge-green min-h-[2rem] flex items-center">Online</span>
          )}
        </div>

        {/* Conference Name */}
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          <a
            href={conference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded"
            dangerouslySetInnerHTML={{
              __html: highlightText(conference.name)
            }}
          />
        </h3>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-zinc-400">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDateRange(conference.startDate, conference.endDate)}</span>
          </div>

          <div className="flex items-center text-sm text-zinc-400">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(getLocationText(conference))
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {conference.tags && conference.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {conference.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
              >
                {tag}
              </span>
            ))}
            {conference.tags.length > 4 && (
              <span className="px-2 py-0.5 rounded text-xs bg-zinc-800/50 text-zinc-500">
                +{conference.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer with links */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {/* Domain indicator */}
          <div className="flex items-center text-sm text-zinc-500">
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: getDomainColor(conference.domain) }}
              aria-hidden="true"
            />
            <span className="capitalize">{conference.domain}</span>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-4">
            {conference.twitter && (
              <a
                href={`https://twitter.com/${conference.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-blue-400 transition-colors p-1 min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center"
                title={`@${conference.twitter}`}
                aria-label={`Twitter @${conference.twitter}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}

            <a
              href={conference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 min-h-[2.75rem] px-2"
              aria-label={`Visit ${conference.name} website`}
            >
              Visit
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}