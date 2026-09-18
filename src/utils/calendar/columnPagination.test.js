import { estimateColumnCapacity, columnPageCount } from './columnPagination';

describe('estimateColumnCapacity', () => {
  it('fits as many cards as the height allows', () => {
    expect(estimateColumnCapacity(400, 76, 8)).toBe(4); // floor(400/84)
  });

  it('falls back to 1 when measurements are missing', () => {
    expect(estimateColumnCapacity(0, 76)).toBe(1);
    expect(estimateColumnCapacity(400, 0)).toBe(1);
  });
});

describe('columnPageCount', () => {
  it('returns 0 pages for an empty column', () => {
    expect(columnPageCount(0, 4)).toBe(0);
  });

  it('returns 1 page when everything fits', () => {
    expect(columnPageCount(3, 4)).toBe(1);
  });

  it('paginates when content exceeds capacity', () => {
    expect(columnPageCount(9, 4)).toBe(3);
  });
});
