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
  const cfpDaysRemaining = conference.cfp
    ? calculateCfpDaysRemaining(conference.cfp.endDate)
    : -1;
  const cfpIsOpen = conference.cfp ? isCfpOpen(conference.cfp.endDate) : false;
  const cfpUrgency = getCfpUrgency(cfpDaysRemaining);

  const highlightText = (text: string): string => {
    if (!searchTerm || !text) return text;
    try {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-blue-500/30 text-blue-300 rounded px-0.5">$1</mark>');
    } catch {
      return text;
    }
  };

  const getCfpBadgeStyle = () => {
    switch (cfpUrgency) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'urgent': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'soon': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'open': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-zinc-500 bg-zinc-800 border-zinc-700';
    }
  };

  const getCfpText = () => {
    if (!cfpIsOpen) return 'CFP Closed';
    if (cfpDaysRemaining === 0) return 'Closes Today';
    if (cfpDaysRemaining === 1) return '1 Day Left';
    if (cfpDaysRemaining <= 7) return `${cfpDaysRemaining} Days Left`;
    return `CFP Open`;
  };

  // Simplified domain colors (border only)
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

  const domainColor = getDomainColor(conference.domain);

  return (
    <article
      className="card group flex flex-col h-full relative overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      {/* Glow effect on hover based on domain */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(to bottom right, ${domainColor}, transparent)` }}
      />

      <div className="p-5 flex flex-col h-full relative z-10">
        {/* Top Row: Domain & CFP */}
        <div className="flex items-center justify-between mb-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ color: domainColor, backgroundColor: domainColor }}
            />
            <span className="text-zinc-400 uppercase tracking-wider">{conference.domain}</span>
          </div>

          {conference.cfp ? (
            <a
              href={conference.cfp.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-2 py-0.5 rounded border ${getCfpBadgeStyle()} transition-colors hover:bg-opacity-20`}
            >
              {getCfpText()}
            </a>
          ) : (
            <span className="text-zinc-600 px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900/50">
              No CFP
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
          <a
            href={conference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-blue-400/30 focus:outline-none"
            dangerouslySetInnerHTML={{ __html: highlightText(conference.name) }}
          />
        </h3>

        {/* Meta: Date & Location */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-zinc-400 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{formatDateRange(conference.startDate, conference.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span dangerouslySetInnerHTML={{ __html: highlightText(getLocationText(conference)) }} />
          </div>
        </div>

        {/* Bottom Section: Pushed down if needed, but keeps compact */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-4 border-t border-dashed border-zinc-800/50">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[1.5rem] relative">
            {conference.financialAid?.available && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20">
                Fin Aid
              </span>
            )}
            {conference.online && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                Online
              </span>
            )}
            {conference.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800">
                {tag}
              </span>
            ))}
          </div>

          {/* Visit Link - Arrow Style */}
          <a
            href={conference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-white hover:text-blue-400 transition-colors whitespace-nowrap pl-2"
          >
            Visit
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
    </article>
  );
}