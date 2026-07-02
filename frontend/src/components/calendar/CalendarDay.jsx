import React from 'react';
import { getCategoryColors } from './EventBadge';

/**
 * CalendarDay — renders a single day cell in the calendar grid.
 *
 * Pure presentation component. Receives all data through props.
 * Does not know anything about the API.
 *
 * @param {{
 *   date: number,
 *   events: Array<{ id: string, category: string }>,
 *   isToday: boolean,
 *   isCurrentMonth: boolean,
 *   className?: string
 * }} props
 */
const CalendarDay = ({ date, events = [], isToday = false, isCurrentMonth = true, className = '' }) => {
  // Show up to 3 category dots
  const dots = events.slice(0, 3);

  return (
    <div
      className={`flex flex-col items-center py-1.5 transition-colors duration-300 ${
        !isCurrentMonth ? 'opacity-30' : ''
      } ${className}`}
    >
      {/* Day number */}
      <span
        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
          isToday
            ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {date}
      </span>

      {/* Event indicator dots */}
      {dots.length > 0 && (
        <div className="flex gap-0.5 mt-1">
          {dots.map((event, idx) => {
            const colors = getCategoryColors(event.category);
            return (
              <div
                key={event.id || idx}
                className={`w-1 h-1 rounded-full ${colors.dot}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(CalendarDay);
