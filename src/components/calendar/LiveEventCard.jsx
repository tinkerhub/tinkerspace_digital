import React from 'react';
import EventBadge, { getStatusIndicator } from './EventBadge';
import EmptyState from './EmptyState';

/**
 * LiveEventCard — displays the currently live event, or an empty state.
 *
 * Receives the event through props. No fetching, no polling, no API calls.
 * Uses the TinkerSpace Digital glass morphism design language.
 *
 * @param {{ event: object|null, className?: string }} props
 */
const LiveEventCard = ({ event = null, className = '' }) => {
  if (!event) {
    return (
      <div
        className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-all duration-500 ${className}`}
      >
        <EmptyState type="live" />
      </div>
    );
  }

  const status = getStatusIndicator(event.status);

  const startTime = new Date(event.starts_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden p-4 transition-all duration-500 ${className}`}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${status.dot}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Event title */}
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 mb-2 transition-colors duration-500">
        {event.title}
      </h4>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3 transition-colors duration-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{startTime}</span>
      </div>

      {/* Category badge */}
      <EventBadge category={event.category} />
    </div>
  );
};

export default React.memo(LiveEventCard);
