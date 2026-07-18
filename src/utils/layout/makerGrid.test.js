import { getMakerCardsPerPage } from './makerGrid';

describe('getMakerCardsPerPage', () => {
  it('reserves the bottom-right slot while retaining a one-slot layout', () => {
    expect(getMakerCardsPerPage(3, 2)).toBe(5);
    expect(getMakerCardsPerPage(1, 1)).toBe(1);
  });
});
