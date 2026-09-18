import { computeSlot } from './computeSlot';

describe('computeSlot', () => {
  it('returns 0 when there is no content', () => {
    expect(computeSlot(0, 0, 5000, 20000)).toBe(0);
  });

  it('returns minSlotMs for a single page (no pagination needed)', () => {
    expect(computeSlot(1, 1, 5000, 20000)).toBe(5000);
  });

  it('scales with pages, under the ceiling', () => {
    expect(computeSlot(9, 3, 5000, 20000)).toBe(15000); // 5000 * 3
  });

  it('clamps to ceilingMs * pages when minSlotMs * pages would exceed it', () => {
    expect(computeSlot(9, 3, 10000, 5000)).toBe(15000); // ceiling(5000) * 3
  });
});
