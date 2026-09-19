// Original design size — sets the maker card's aspect ratio and caps how
// big a card can render (never grows past this).
export const CARD_WIDTH = 211;
export const CARD_HEIGHT = 257;
export const CARD_GAP = 32;

/** Returns the maker cards that fit in one page of the grid. */
export function getMakerCardsPerPage(cols, rows) {
  return cols * rows;
}
