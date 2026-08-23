import React, { useState, useEffect, useMemo } from 'react';
import { getCategoryColors } from './EventBadge';
import { layoutWeekEvents } from '../../utils/calendar/calendarLayout';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateMonthGrid(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    cells.push({
      date: new Date(year, month - 1, day),
      dayOfMonth: day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      dayOfMonth: day,
      isCurrentMonth: true,
    });
  }

  const remainingCells = 42 - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    cells.push({
      date: new Date(year, month + 1, day),
      dayOfMonth: day,
      isCurrentMonth: false,
    });
  }

  return cells;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * WeekEventGrid — renders event bars for a single week with a stationary
 * 2-page crossfade when events overflow the available row height.
 */
const WeekEventGrid = ({ tracks, page }) => {
  // Columns with overflow (trackIdx >= 2)
  const overflowingCols = useMemo(() => {
    const cols = new Set();
    tracks.forEach(event => {
      if (event.trackIdx >= 2) {
        for (let c = event.startCol; c < event.startCol + event.span; c++) {
          cols.add(c);
        }
      }
    });
    return cols;
  }, [tracks]);

  const hasMultiplePages = overflowingCols.size > 0;

  // Page 0: top 2 tracks
  const page0Events = useMemo(() => {
    return tracks.filter(t => t.trackIdx < 2);
  }, [tracks]);

  // Page 1: overflow tracks in top slots + keep non-overflowing days visible
  const page1Events = useMemo(() => {
    if (!hasMultiplePages) return page0Events;

    const events = [];
    tracks.forEach(event => {
      if (event.trackIdx >= 2) {
        events.push({
          ...event,
          displayRow: event.trackIdx - 2 + 1,
        });
      } else {
        let overlapsWithOverflow = false;
        for (let c = event.startCol; c < event.startCol + event.span; c++) {
          if (overflowingCols.has(c)) {
            overlapsWithOverflow = true;
            break;
          }
        }
        if (!overlapsWithOverflow) {
          events.push({
            ...event,
            displayRow: event.trackIdx + 1,
          });
        }
      }
    });
    return events;
  }, [tracks, hasMultiplePages, overflowingCols, page0Events]);

  if (!hasMultiplePages) {
    return (
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div className="grid grid-cols-7 auto-rows-max gap-y-1 py-0.5">
          {page0Events.map((event, idx) => {
            const colors = getCategoryColors(event.category);
            return (
              <div
                key={`single-${event.id || idx}`}
                style={{ gridColumn: `${event.startCol} / span ${event.span}`, gridRow: event.trackIdx + 1 }}
                className="px-1 z-10"
              >
                <div className={`truncate text-xs font-semibold tracking-wide leading-snug px-2 py-1 rounded-sm ${colors.badge}`}>
                  {event.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden relative">
      {/* Page 0 Layer (0s - 5s) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
          page === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}
      >
        <div className="grid grid-cols-7 auto-rows-max gap-y-1 py-0.5">
          {page0Events.map((event, idx) => {
            const colors = getCategoryColors(event.category);
            return (
              <div
                key={`p0-${event.id || idx}`}
                style={{ gridColumn: `${event.startCol} / span ${event.span}`, gridRow: event.trackIdx + 1 }}
                className="px-1 z-10"
              >
                <div className={`truncate text-xs font-semibold tracking-wide leading-snug px-2 py-1 rounded-sm ${colors.badge}`}>
                  {event.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page 1 Layer (5s - 10s) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
          page === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}
      >
        <div className="grid grid-cols-7 auto-rows-max gap-y-1 py-0.5">
          {page1Events.map((event, idx) => {
            const colors = getCategoryColors(event.category);
            return (
              <div
                key={`p1-${event.id || idx}`}
                style={{ gridColumn: `${event.startCol} / span ${event.span}`, gridRow: event.displayRow }}
                className="px-1 z-10"
              >
                <div className={`truncate text-xs font-semibold tracking-wide leading-snug px-2 py-1 rounded-sm ${colors.badge}`}>
                  {event.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const CalendarGrid = ({ currentDate, events = [], isActive = true, className = '' }) => {
  const today = new Date();
  const cells = generateMonthGrid(currentDate);
  const [page, setPage] = useState(0);

  // Synchronize 5-second page cycle when calendar is active
  useEffect(() => {
    if (!isActive) {
      setPage(0);
      return;
    }

    setPage(0);
    const interval = setInterval(() => {
      setPage(p => (p === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Group cells into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-white/20 dark:border-white/10">
        {DAY_LABELS.map(label => (
          <div
            key={label}
            className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex flex-col flex-1 border-l border-t border-white/20 dark:border-white/10">
        {weeks.map((week, weekIdx) => {
          const { tracks } = layoutWeekEvents(week, events);

          return (
            <div key={weekIdx} className="relative flex-1 min-h-[90px] border-b border-white/20 dark:border-white/10 flex flex-col">
              
              {/* Background grid for cells */}
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                {week.map((cell, idx) => (
                  <div key={idx} className="border-r border-white/20 dark:border-white/10" />
                ))}
              </div>
              
              {/* Day numbers — pinned at top */}
              <div className="grid grid-cols-7 relative z-10 flex-shrink-0">
                {week.map((cell, idx) => (
                  <div key={`day-${idx}`} className="px-1.5 py-0.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                        isSameDay(cell.date, today)
                          ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                          : !cell.isCurrentMonth
                            ? 'text-gray-400/50 dark:text-gray-500/50'
                            : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cell.dayOfMonth}
                    </span>
                  </div>
                ))}
              </div>

              {/* Event bars — synchronized stationary crossfade */}
              <WeekEventGrid tracks={tracks} page={page} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CalendarGrid);
