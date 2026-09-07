/**
 * Which TinkerSpace this display shows events for.
 *
 * Configured via env for now (REACT_APP_SPACE_ID, defaulting to '1').
 * This is the single seam an eventual admin dashboard will replace —
 * everything else in the app calls getConfiguredSpaceId() and never
 * touches process.env directly.
 */
const DEFAULT_SPACE_ID = '1';

export function getConfiguredSpaceId() {
  const raw = process.env.REACT_APP_SPACE_ID;
  return raw && raw.trim() !== '' ? raw.trim() : DEFAULT_SPACE_ID;
}
