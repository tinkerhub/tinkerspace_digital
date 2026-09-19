// Sets the maker card's aspect ratio and caps how big a card can render
// (never grows past this). Sized for 12 columns at a 1920px-wide screen.
export const CARD_WIDTH = 120;
export const CARD_HEIGHT = 146;
export const CARD_GAP = 32;

/** Returns the maker cards that fit in one page of the grid. */
export function getMakerCardsPerPage(cols, rows) {
  return cols * rows;
}
