/** Returns the maker cards that fit while reserving the bottom-right mascot slot. */
export function getMakerCardsPerPage(cols, rows) {
  const totalSlots = cols * rows;
  return Math.max(1, totalSlots - (totalSlots > 1 ? 1 : 0));
}
