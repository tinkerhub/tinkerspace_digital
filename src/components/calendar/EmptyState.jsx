import React from 'react';

/**
 * EmptyState — a reusable empty state component for the calendar system.
 *
 * Supports contextual messages for different empty scenarios.
 *
 * @param {{ type: 'live' | 'upcoming' | 'calendar', className?: string }} props
 */

const EMPTY_STATES = {
  live: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'No event happening now',
    subtitle: 'Check back later for live events',
  },
  upcoming: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'No upcoming events',
    subtitle: 'New events will appear here',
  },
  calendar: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    ),
    title: 'No calendar events',
    subtitle: 'This month has no events scheduled',
  },
};

const EmptyState = ({ type = 'calendar', className = '' }) => {
  const state = EMPTY_STATES[type] || EMPTY_STATES.calendar;

  return (
    <div
      className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}
    >
      <div className="text-gray-300 dark:text-gray-600 mb-3 transition-colors duration-500">
        {state.icon}
      </div>
      <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wide transition-colors duration-500">
        {state.title}
      </p>
      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 transition-colors duration-500">
        {state.subtitle}
      </p>
    </div>
  );
};

export default React.memo(EmptyState);
