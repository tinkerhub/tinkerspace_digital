/**
 * Calendar Component Library
 *
 * Barrel export for the calendar component system.
 * All components are presentation-only — they receive data through
 * props and never call APIs or create side effects.
 */

export { default as Calendar } from './Calendar';
export { default as CalendarHeader } from './CalendarHeader';
export { default as CalendarGrid } from './CalendarGrid';
export { default as EventBadge, getCategoryColors, getStatusIndicator } from './EventBadge';
export { default as LiveEventCard } from './LiveEventCard';
export { default as UpcomingEvents } from './UpcomingEvents';
export { default as EmptyState } from './EmptyState';
