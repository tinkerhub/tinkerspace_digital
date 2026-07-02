import React from 'react';
import CalendarDay from './CalendarDay';

/**
 * CalendarGrid — renders a monthly calendar grid with day headers and event indicators.
 *
 * Pure rendering component. All calendar math is done here from the
 * currentDate and events props. No API calls, no side effects.
 *
 * @param {{
 *   currentDate: Date,
 *   events: Array<{ id: string, title: string, starts_at: string, ends_at: string|null, category: string, status: string }>,
 *   className?: string
 * }} props
 */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generates the 6-row × 7-col grid of dates for a given month.
 * Each entry: { date, dayOfMonth, isCurrentMonth }
 */
function generateMonthGrid(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Day of week the month starts on (0 = Sun)
  const startDayOfWeek = firstDay.getDay();

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  // Previous month's trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Fill leading days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    cells.push({
      date: new Date(year, month - 1, day),
      dayOfMonth: day,
      isCurrentMonth: false,
    });
  }

  // Fill current month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      dayOfMonth: day,
      isCurrentMonth: true,
    });
  }

  // Fill trailing days from next month
  const remainingCells = 42 - cells.length; // 6 rows × 7 cols
  for (let day = 1; day <= remainingCells; day++) {
    cells.push({
      date: new Date(year, month + 1, day),
      dayOfMonth: day,
      isCurrentMonth: false,
    });
  }

  return cells;
}

/**
 * Groups events by date key (YYYY-MM-DD) for O(1) lookup.
 * Events spanning multiple days appear under each day they cover.
 */
function groupEventsByDate(events) {
  const map = {};

  events.forEach(event => {
    const start = new Date(event.starts_at);
    const end = event.ends_at ? new Date(event.ends_at) : start;

    // Normalise to date-only
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    let current = new Date(startDate);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(event);
      current.setDate(current.getDate() + 1);
    }
  });

  return map;
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
  const eventsByDate = groupEventsByDate(events);

  return (
    <div className={className}>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(label => (
          <div
            key={label}
            className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 py-1.5 transition-colors duration-500"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const key = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
          const dayEvents = eventsByDate[key] || [];

          return (
            <CalendarDay
              key={idx}
              date={cell.dayOfMonth}
              events={dayEvents}
              isToday={isSameDay(cell.date, today)}
              isCurrentMonth={cell.isCurrentMonth}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CalendarGrid);
