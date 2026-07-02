import React from 'react';

/**
 * CalendarHeader — displays the current month and year.
 *
 * This is a display-only component. No navigation, no buttons, no interaction.
 *
 * @param {{ currentDate: Date, className?: string }} props
 */
const CalendarHeader = ({ currentDate, className = '' }) => {
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight transition-colors duration-500">
        {month}
      </h3>
      <span className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-wide transition-colors duration-500">
        {year}
      </span>
    </div>
  );
};

export default React.memo(CalendarHeader);
