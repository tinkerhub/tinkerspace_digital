import React from 'react';
import { Calendar, LiveEventCard, UpcomingEvents } from '../calendar';

/**
 * CalendarDashboard — dedicated calendar view for the Digital Screen.
 *
 * Layout (rendered beneath the shared Header in App.js):
 *   ┌──────────────────────────────────────────┐
 *   │                                          │
 *   │      Calendar (~70%)  │  Live Event      │
 *   │                       ├─────────────────-│
 *   │                       │  Upcoming (×5)   │
 *   └──────────────────────────────────────────┘
 *
 * Presentational only — data comes from useCalendarData in App.js (lifted
 * up so the rotation orchestrator can see calendar event counts without a
 * second, independent fetch/poll cycle).
 */
const CalendarDashboard = ({
  isInitialLoad,
  currentDate,
  calendarEvents,
  liveEvent,
  upcomingEvents,
  calendarDurationMs,
  onPagesChange,
}) => {
  // ── Render: initial loading state ──────────────────────────────
  if (isInitialLoad) {
    return (
      <div className="flex-1 flex items-center justify-center px-12 font-geist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin transition-colors duration-500" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider uppercase transition-colors duration-500">
            Loading calendar
          </span>
        </div>
      </div>
    );
  }

  // ── Render: dashboard ──────────────────────────────────────────
  return (
    <div className="flex-1 flex gap-6 px-12 pt-[clamp(1rem,2vh,1.5rem)] pb-24 mt-[clamp(0.5rem,1vh,1rem)] overflow-hidden font-geist">

      {/* LEFT — Calendar (~70%) */}
      <div className="flex-[7] min-w-0">
        <Calendar
          events={calendarEvents}
          currentDate={currentDate}
          className="h-full"
          calendarDurationMs={calendarDurationMs}
          onPagesChange={onPagesChange}
        />
      </div>

      {/* RIGHT — Sidebar (~30%) */}
      <div className="flex-[3] min-w-0 flex flex-col gap-6">
        {/* Live Event */}
        <LiveEventCard event={liveEvent} />

        {/* Upcoming Events */}
        <UpcomingEvents
          events={upcomingEvents}
          className="flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
};

export default React.memo(CalendarDashboard);
