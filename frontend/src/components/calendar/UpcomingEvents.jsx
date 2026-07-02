import React from 'react';
import EventBadge from './EventBadge';
import EmptyState from './EmptyState';

/**
 * UpcomingEvents — renders a list of up to five upcoming events.
 *
 * Receives events through props. No fetching, no polling, no API calls.
 * Uses the TinkerSpace Digital glass morphism design language.
 *
 * @param {{ events: Array, className?: string }} props
 */
const UpcomingEvents = ({ events = [], className = '' }) => {
  const display = events.slice(0, 5);

  if (display.length === 0) {
    return (
      <div
        className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-all duration-500 ${className}`}
      >
        <EmptyState type="upcoming" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-all duration-500 ${className}`}
    >
      {/* Section label */}
      <div className="px-4 pt-4 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors duration-500">
          Upcoming
        </h4>
      </div>

      {/* Event list */}
      <div className="flex flex-col">
        {display.map((event, idx) => {
          const startDate = new Date(event.starts_at);
          const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();
          const day = startDate.getDate();
          const time = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          return (
            <div
              key={event.id || idx}
              className={`flex items-center gap-3 px-4 py-3 transition-colors duration-300 ${
                idx < display.length - 1
                  ? 'border-b border-gray-200/30 dark:border-white/5'
                  : ''
              }`}
            >
              {/* Date block */}
              <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none transition-colors duration-500">
                  {month}
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight transition-colors duration-500">
                  {day}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200/50 dark:bg-gray-600/30 flex-shrink-0 transition-colors duration-500" />

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-snug transition-colors duration-500">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 transition-colors duration-500">
                    {time}
                  </span>
                  <EventBadge category={event.category} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(UpcomingEvents);
