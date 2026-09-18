function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * How long a rotation view should stay up, given how much content it holds.
 * `ceilingMs` is a per-page configured duration, not a flat total — the
 * slot scales with `pages` so a heavier component gets proportionally more
 * time, floored/ceilinged by `minSlotMs`/`ceilingMs * pages`.
 */
export function computeSlot(count, pages, minSlotMs, ceilingMs) {
  if (count === 0) return 0;
  if (pages <= 1) return minSlotMs;
  return clamp(minSlotMs * pages, minSlotMs, ceilingMs * pages);
}
