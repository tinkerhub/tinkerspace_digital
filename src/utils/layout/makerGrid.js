const NORMAL_CARD = { width: 211, height: 257, gap: 32, padding: 48 };

// Largest → smallest. Smallest is the fallback: pagination is fine below it.
// Add more numbers here to add more steps — nothing else needs to change.
const CARD_WIDTHS = [211, 160, 120, 90];

// Each tier's height/gap/padding derive from NORMAL_CARD by the same scale
// as its width, so card size, spacing, and inner content all shrink together.
export const CARD_TIERS = CARD_WIDTHS.map((width) => {
  const scale = width / NORMAL_CARD.width;
  return {
    width,
    height: Math.round(width * (NORMAL_CARD.height / NORMAL_CARD.width)),
    gap: Math.round(NORMAL_CARD.gap * scale),
    padding: Math.round(NORMAL_CARD.padding * scale),
    scale,
  };
});

/** Returns the maker cards that fit in one page of the grid. */
export function getMakerCardsPerPage(cols, rows) {
  return cols * rows;
}
