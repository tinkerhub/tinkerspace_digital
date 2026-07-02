import React, { useState, useEffect, useRef } from 'react';
import EventBadge from './EventBadge';
import EmptyState from './EmptyState';

const MarqueeText = ({ text, className }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden whitespace-nowrap ${className}`}>
      <div 
        className={isOverflowing ? "inline-block" : "block truncate"}
        style={isOverflowing ? { animation: 'marquee 10s linear infinite' } : {}}
      >
        <span ref={textRef} style={{ paddingRight: isOverflowing ? '2rem' : '0' }}>{text}</span>
        {isOverflowing && <span style={{ paddingRight: '2rem' }}>{text}</span>}
      </div>
    </div>
  );
};

/**
 * UpcomingEvents — renders a paginated list of upcoming events.
 *
 * Receives events through props. No fetching, no polling, no API calls.
 * Uses the TinkerSpace Digital glass morphism design language.
 *
 * @param {{ events: Array, className?: string }} props
 */
const UpcomingEvents = ({ events = [], className = '' }) => {
  const [page, setPage] = useState(0);
  const eventsPerPage = 5;
  const totalPages = Math.ceil(events.length / eventsPerPage) || 1;

  // Reset page when events change
  useEffect(() => {
    setPage(0);
  }, [events.length]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setPage(p => (p + 1) % totalPages);
    }, 10000); // 10 seconds per page
    return () => clearInterval(interval);
  }, [totalPages]);

  const start = page * eventsPerPage;
  const display = events.slice(start, start + eventsPerPage);

  if (events.length === 0) {
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
      className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-all duration-500 relative flex flex-col ${className}`}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* Section label and Page indicator */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors duration-500">
          Upcoming
        </h4>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 opacity-60">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === page ? 'bg-gray-800 dark:bg-white scale-125' : 'bg-gray-400 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event list */}
      <div className="flex flex-col flex-1">
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
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <MarqueeText 
                  text={event.title} 
                  className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug transition-colors duration-500" 
                />
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 transition-colors duration-500 flex-shrink-0">
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
