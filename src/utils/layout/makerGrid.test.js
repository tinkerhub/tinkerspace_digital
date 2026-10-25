import { getMakerCardsPerPage } from './makerGrid';

describe('getMakerCardsPerPage', () => {
  it('returns the full grid capacity', () => {
    expect(getMakerCardsPerPage(3, 2)).toBe(6);
    expect(getMakerCardsPerPage(1, 1)).toBe(1);
  });
});
