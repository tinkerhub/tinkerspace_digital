/**
 * Display Orchestration Configuration
 *
 * Single source of truth for all display timing and rotation settings.
 * The orchestrator reads from this object — no hardcoded values elsewhere.
 *
 * @module displayConfig
 */

const DISPLAY_CONFIG = Object.freeze({
  /** Duration (ms) the Maker pages are shown before rotating */
  MAKER_DURATION: 20_000,

  /** Duration (ms) the Calendar Dashboard is shown before rotating */
  CALENDAR_DURATION: 10_000,

  /** Display views — used as state values by the orchestrator */
  VIEWS: Object.freeze({
    MAKERS: 'makers',
    CALENDAR: 'calendar',
  }),
});

export default DISPLAY_CONFIG;
