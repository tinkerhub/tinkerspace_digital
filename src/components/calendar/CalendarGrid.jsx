import React from 'react';
import { getCategoryColors } from './EventBadge';
import { layoutWeekEvents, MAX_TRACKS } from '../../utils/calendar/calendarLayout';

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
          // Offload layout calculations to dedicated utility
          const { tracks, overflows } = layoutWeekEvents(week, events);

          return (
            <div key={weekIdx} className="relative flex-1 min-h-[90px] border-b border-white/20 dark:border-white/10">
              
              {/* Background grid for cells */}
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                {week.map((cell, idx) => (
                  <div key={idx} className="border-r border-white/20 dark:border-white/10" />
                ))}
              </div>
              
              {/* Foreground content grid */}
              <div className="grid grid-cols-7 auto-rows-max gap-y-1 py-1 relative z-10 h-full">
                {/* Row 1: Day numbers */}
                {week.map((cell, idx) => (
                  <div key={`day-${idx}`} style={{ gridColumn: idx + 1, gridRow: 1 }} className="px-1.5 pb-0.5">
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

                {/* Rows 2+: Continuous Event Bars */}
                {tracks.map((event, idx) => {
                  const colors = getCategoryColors(event.category);
                  return (
                    <div
                      key={`event-${event.id}-${idx}`}
                      style={{ gridColumn: `${event.startCol} / span ${event.span}`, gridRow: event.trackIdx + 2 }}
                      className="px-1 z-10"
                    >
                      <div className={`truncate text-[10px] font-semibold tracking-wide leading-tight px-1.5 py-0.5 rounded-none ${colors.badge}`}>
                        {event.title}
                      </div>
                    </div>
                  );
                })}
                
                {/* Overflow indicators */}
                {overflows.map((count, colIdx) => {
                  if (count === 0) return null;
                  return (
                    <div
                      key={`overflow-${colIdx}`}
                      style={{ gridColumn: colIdx + 1, gridRow: MAX_TRACKS + 2 }}
                      className="px-2 text-[9px] font-medium text-gray-500 dark:text-gray-400 mt-0.5"
                    >
                      +{count} more
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CalendarGrid);
