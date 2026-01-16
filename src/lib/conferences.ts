/**
 * Conference utilities for conf-finder v2.0
 *
 * Provides formatting and helper functions for conferences.
 * Data loading is now handled by staticData.ts
 */

import { Conference } from '@/types/conference';

/**
 * Format a single date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Same day
    if (startDate === endDate) {
      return formatDate(startDate);
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }

    // Different months
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

/**
 * Get location text for display
 */
export function getLocationText(conference: Conference): string {
  if (conference.hybrid) {
    if (conference.city && conference.country) {
      return `${conference.city}, ${conference.country} (Hybrid)`;
    }
    return 'Hybrid';
  }

  if (conference.online) {
    return 'Online';
  }

  if (conference.city && conference.country) {
    return `${conference.city}, ${conference.country}`;
  }

  return conference.city || conference.country || 'Location TBD';
}

/**
 * Get days until conference starts
 */
export function getDaysUntilConference(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if conference is happening soon (within 30 days)
 */
export function isHappeningSoon(startDate: string): boolean {
  const days = getDaysUntilConference(startDate);
  return days >= 0 && days <= 30;
}

/**
 * Get domain emoji icon
 */
export function getDomainIcon(domain: string): string {
  const icons: Record<string, string> = {
    ai: '🤖',
    web: '🌐',
    mobile: '📱',
    devops: '☁️',
    security: '🔒',
    data: '📊',
    gaming: '🎮',
    blockchain: '⛓️',
    ux: '🎨',
    opensource: '💚',
    general: '💻'
  };

  return icons[domain] || '📌';
}

/**
 * Get domain color
 */
export function getDomainColor(domain: string): string {
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
}