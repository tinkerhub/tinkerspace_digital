import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getCategoryColors } from './EventBadge';
import { getWeekDays, getEventsForDay } from '../../utils/calendar/calendarLayout';
import { estimateColumnCapacity, columnPageCount } from '../../utils/calendar/columnPagination';

const DEFAULT_CALENDAR_DURATION_MS = 10_000;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const EventCard = ({ event, cardRef }) => {
  const colors = getCategoryColors(event.category);
  return (
    <div ref={cardRef} className={`rounded-lg border px-4 py-3 ${colors.badge} ${colors.border}`}>
      <div className="text-base font-bold leading-snug line-clamp-3">{event.title}</div>
      <div className="text-xs font-semibold opacity-70 mt-1">{formatTime(event.starts_at)}</div>
    </div>
  );
};

/**
 * DayColumn — vertical stack of event cards for one day. When everything
 * fits, renders statically. When it overflows, paginates discretely at
 * `calendarDurationMs` per page (capacity estimated from the container's
 * measured height and one rendered card's height) instead of a continuous
 * scroll — so page timing tracks the admin-configured duration.
 */
const DayColumn = ({ dayEvents, calendarDurationMs = DEFAULT_CALENDAR_DURATION_MS, onPagesChange }) => {
  const containerRef = useRef(null);
  const firstCardRef = useRef(null);
  const [capacity, setCapacity] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    if (containerRef.current && firstCardRef.current) {
      setCapacity(estimateColumnCapacity(containerRef.current.clientHeight, firstCardRef.current.offsetHeight));
    }
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dayEvents, measure]);

  const pages = columnPageCount(dayEvents.length, capacity);

  useEffect(() => {
    setPage(0);
  }, [dayEvents, capacity]);

  useEffect(() => {
    onPagesChange?.(pages);
  }, [pages, onPagesChange]);

  useEffect(() => {
    if (pages <= 1) return;
    const interval = setInterval(() => {
      setPage((p) => (p + 1) % pages);
    }, calendarDurationMs);
    return () => clearInterval(interval);
  }, [pages, calendarDurationMs]);

  if (dayEvents.length === 0) {
    // Empty day, not an empty week — stay visible and silent (the 7-day
    // grid shape is preserved), no per-day label.
    return <div ref={containerRef} className="flex-1 min-h-0" />;
  }

  const visibleEvents = pages <= 1 ? dayEvents : dayEvents.slice(page * capacity, page * capacity + capacity);

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden relative">
      <div className="flex flex-col gap-2 px-2 py-1">
        {visibleEvents.map((event, i) => (
          <EventCard key={event.id} event={event} cardRef={i === 0 ? firstCardRef : undefined} />
        ))}
      </div>
    </div>
  );
};

/**
 * CalendarKanban — week-columns board view for TV signage: 7 columns
 * (Sun–Sat of the current week), each a vertical stack of event cards.
 */
const CalendarKanban = ({ currentDate, events = [], className = '', calendarDurationMs, onPagesChange }) => {
  const today = new Date();
  const weekDays = getWeekDays(currentDate);
  const eventsByDay = weekDays.map((day) => getEventsForDay(day, events));
  const weekHasEvents = eventsByDay.some((dayEvents) => dayEvents.length > 0);
  // Per-column page counts, aggregated to a max and reported up — the
  // calendar view only needs to stay up long enough for the slowest column.
  const columnPagesRef = useRef({});
  const handleColumnPages = useCallback(
    (idx, pages) => {
      columnPagesRef.current[idx] = pages;
      onPagesChange?.(Math.max(0, ...Object.values(columnPagesRef.current)));
    },
    [onPagesChange]
  );

  if (!weekHasEvents) {
    return (
      <div className={`flex w-full h-full items-center justify-center ${className}`}>
        <span className="text-sm text-gray-400 dark:text-gray-600">No events this week</span>
      </div>
    );
  }

  return (
    <div className={`flex w-full h-full gap-2 ${className}`}>
      {weekDays.map((day, idx) => {
        const dayEvents = eventsByDay[idx];
        return (
          <div
            key={idx}
            className="flex-1 min-w-0 flex flex-col border-r last:border-r-0 border-white/20 dark:border-white/10"
          >
            <div className="flex flex-col items-center py-2 border-b border-white/20 dark:border-white/10 flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {DAY_LABELS[idx]}
              </span>
              <span
                className={`mt-1 text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                  isSameDay(day, today)
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {day.getDate()}
              </span>
            </div>
            <DayColumn
              dayEvents={dayEvents}
              calendarDurationMs={calendarDurationMs}
              onPagesChange={(pages) => handleColumnPages(idx, pages)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CalendarKanban);
