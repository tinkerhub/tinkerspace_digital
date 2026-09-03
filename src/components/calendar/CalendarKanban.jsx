import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getCategoryColors } from './EventBadge';
import { getWeekDays, getEventsForDay } from '../../utils/calendar/calendarLayout';

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

const EventCard = ({ event }) => {
  const colors = getCategoryColors(event.category);
  return (
    <div className={`rounded-lg border px-4 py-3 ${colors.badge} ${colors.border}`}>
      <div className="text-base font-bold leading-snug line-clamp-3">{event.title}</div>
      <div className="text-xs font-semibold opacity-70 mt-1">{formatTime(event.starts_at)}</div>
    </div>
  );
};

/**
 * DayColumn — vertical stack of event cards for one day. Auto-scrolls when
 * overflowing, using the same offsetTop-measured loop-seam fix as
 * AutoScrollEvents in CalendarGrid.jsx (real gap between original/duplicate
 * blocks, not an assumed margin value).
 */
const DayColumn = ({ dayEvents, dayIdx }) => {
  const containerRef = useRef(null);
  const originalRef = useRef(null);
  const duplicateRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && originalRef.current) {
      const containerH = containerRef.current.clientHeight;
      const originalH = originalRef.current.scrollHeight;
      const overflowing = originalH > containerH + 2; // 2px tolerance
      setIsOverflowing(overflowing);
      setContentHeight(
        overflowing && duplicateRef.current
          ? duplicateRef.current.offsetTop - originalRef.current.offsetTop
          : originalH
      );
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dayEvents, checkOverflow]);

  useEffect(() => {
    if (isOverflowing) checkOverflow();
  }, [isOverflowing, checkOverflow]);

  const animationName = `dayScroll-${dayIdx}`;
  const duration = Math.max(contentHeight / 12, 8); // ~12px/sec, minimum 8s

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden relative">
      {isOverflowing && (
        <style>{`
          @keyframes ${animationName} {
            0% { transform: translateY(0); }
            45% { transform: translateY(-${contentHeight}px); }
            50% { transform: translateY(-${contentHeight}px); }
            95% { transform: translateY(0); }
            100% { transform: translateY(0); }
          }
        `}</style>
      )}
      <div style={isOverflowing ? { animation: `${animationName} ${duration}s ease-in-out infinite` } : undefined}>
        <div ref={originalRef} className="flex flex-col gap-2 px-2 py-1">
          {dayEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
        {isOverflowing && (
          <div ref={duplicateRef} className="flex flex-col gap-2 px-2 py-1 mt-2">
            {dayEvents.map(event => <EventCard key={`dup-${event.id}`} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CalendarKanban — week-columns board view for TV signage: 7 columns
 * (Sun–Sat of the current week), each a vertical stack of event cards.
 */
const CalendarKanban = ({ currentDate, events = [], className = '' }) => {
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  return (
    <div className={`flex w-full h-full gap-2 ${className}`}>
      {weekDays.map((day, idx) => {
        const dayEvents = getEventsForDay(day, events);
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
            <DayColumn dayEvents={dayEvents} dayIdx={idx} />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CalendarKanban);
