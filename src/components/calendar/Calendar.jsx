import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EmptyState from './EmptyState';

/**
 * Calendar — top-level calendar component.
 *
 * Composes CalendarHeader and CalendarGrid into a single presentational unit.
 * Receives all data through props. No fetching, no polling, no API calls.
 *
 * @param {{
 *   events: Array<{ id: string, title: string, starts_at: string, ends_at: string|null, category: string, status: string }>,
 *   currentDate: Date,
 *   className?: string
 * }} props
 */
const Calendar = ({ events = [], currentDate, className = '' }) => {
  const displayDate = currentDate || new Date();

  return (
    <div
      className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden p-4 transition-all duration-500 ${className}`}
    >
      <CalendarHeader currentDate={displayDate} className="mb-3" />

      {events.length > 0 ? (
        <CalendarGrid
          currentDate={displayDate}
          events={events}
        />
      ) : (
        <EmptyState type="calendar" />
      )}
    </div>
  );
};

export default React.memo(Calendar);
