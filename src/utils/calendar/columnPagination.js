const CARD_GAP_PX = 8; // matches DayColumn's `gap-2` (0.5rem)

/** How many event cards fit in a day-column's available height. */
export function estimateColumnCapacity(containerHeight, cardHeight, gap = CARD_GAP_PX) {
  if (!containerHeight || !cardHeight) return 1;
  return Math.max(1, Math.floor(containerHeight / (cardHeight + gap)));
}

/** How many discrete pages a day-column needs to show all its events. */
export function columnPageCount(eventCount, capacity) {
  if (eventCount === 0) return 0;
  return Math.ceil(eventCount / Math.max(1, capacity));
}
