import React from 'react';

/**
 * Category color system ported from SpaceCalendar.
 * Returns Tailwind classes for background, text, and border
 * that work in both light and dark mode.
 */

const CATEGORY_COLORS = {
  'Workshop': {
    dot: 'bg-teal-500',
    badge: 'bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-400',
    border: 'border-teal-200/60 dark:border-teal-500/20',
  },
  'Community': {
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400',
    border: 'border-purple-200/60 dark:border-purple-500/20',
  },
  'Hackathon': {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-500/20',
  },
  'Research': {
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400',
    border: 'border-blue-200/60 dark:border-blue-500/20',
  },
  'Talk': {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400',
    border: 'border-rose-200/60 dark:border-rose-500/20',
  },
  'Meetup': {
    dot: 'bg-green-500',
    badge: 'bg-green-500/10 text-green-600 dark:bg-green-400/15 dark:text-green-400',
    border: 'border-green-200/60 dark:border-green-500/20',
  },
  'Learning Program': {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400',
    border: 'border-indigo-200/60 dark:border-indigo-500/20',
  },
  'General Event': {
    dot: 'bg-gray-500',
    badge: 'bg-gray-500/10 text-gray-600 dark:bg-gray-400/15 dark:text-gray-400',
    border: 'border-gray-200/60 dark:border-gray-500/20',
  },
};

const DEFAULT_COLORS = {
  dot: 'bg-gray-400',
  badge: 'bg-gray-500/10 text-gray-600 dark:bg-gray-400/15 dark:text-gray-400',
  border: 'border-gray-200/60 dark:border-gray-500/20',
};

/**
 * Returns the color set for a given category.
 * @param {string} category
 * @returns {{ dot: string, badge: string, border: string }}
 */
export function getCategoryColors(category) {
  return CATEGORY_COLORS[category] || DEFAULT_COLORS;
}

/**
 * STATUS_COLORS maps event statuses to visual indicators.
 */
const STATUS_INDICATORS = {
  'ongoing': {
    label: 'Live',
    dot: 'bg-green-500 animate-pulse',
    text: 'text-green-600 dark:text-green-400',
  },
  'upcoming': {
    label: 'Upcoming',
    dot: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  'completed': {
    label: 'Completed',
    dot: 'bg-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
  },
  'cancelled': {
    label: 'Cancelled',
    dot: 'bg-red-400',
    text: 'text-red-500 dark:text-red-400',
  },
};

const DEFAULT_STATUS = {
  label: 'Event',
  dot: 'bg-gray-400',
  text: 'text-gray-500 dark:text-gray-400',
};

/**
 * Returns status indicator metadata for a given status string.
 * @param {string} status
 * @returns {{ label: string, dot: string, text: string }}
 */
export function getStatusIndicator(status) {
  return STATUS_INDICATORS[status] || DEFAULT_STATUS;
}

/**
 * EventBadge — renders a small colored badge for an event's category.
 *
 * @param {{ category: string, className?: string }} props
 */
const EventBadge = ({ category, className = '' }) => {
  const colors = getCategoryColors(category);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors.badge} ${colors.border} ${className}`}
    >
      {category}
    </span>
  );
};

export default React.memo(EventBadge);
