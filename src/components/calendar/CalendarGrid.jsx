import React, { useRef, useState, useEffect, useCallback } from 'react';
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
 * AutoScrollEvents — renders event bars in a grid that auto-scrolls
 * vertically when content overflows the container.
 */
const AutoScrollEvents = ({ tracks, weekIdx }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const originalRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && originalRef.current) {
      const containerH = containerRef.current.clientHeight;
      const originalH = originalRef.current.scrollHeight;
      setIsOverflowing(originalH > containerH + 2); // 2px tolerance
      setContentHeight(originalH);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [tracks, checkOverflow]);

  const animationName = `weekScroll-${weekIdx}`;
  // Scroll through original content height, pause, then loop
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
      <div
        ref={contentRef}
        style={isOverflowing ? {
          animation: `${animationName} ${duration}s ease-in-out infinite`,
        } : undefined}
      >
        <div ref={originalRef} className="grid grid-cols-7 auto-rows-max gap-y-1 py-0.5">
          {tracks.map((event, idx) => {
            const colors = getCategoryColors(event.category);
            return (
              <div
                key={`event-${event.id}-${idx}`}
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
        {/* Duplicate for seamless loop */}
        {isOverflowing && (
          <div className="grid grid-cols-7 auto-rows-max gap-y-1 py-0.5 mt-1">
            {tracks.map((event, idx) => {
              const colors = getCategoryColors(event.category);
              return (
                <div
                  key={`event-dup-${event.id}-${idx}`}
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
        )}
      </div>
    </div>
  );
};


const CalendarGrid = ({ currentDate, events = [], className = '' }) => {
  const today = new Date();
  const cells = generateMonthGrid(currentDate);
  
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

              {/* Event bars — auto-scrolls when overflowing */}
              <AutoScrollEvents tracks={tracks} weekIdx={weekIdx} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CalendarGrid);
