import { describe, it, expect } from 'vitest';
import { removeDuplicates } from './removeDuplicates';

describe('removeDuplicates helper', () => {
  it('returns empty array when passed null, undefined, or empty array', () => {
    expect(removeDuplicates(null)).toEqual([]);
    expect(removeDuplicates(undefined)).toEqual([]);
    expect(removeDuplicates([])).toEqual([]);
  });

  it('safely handles non-array objects without throwing TypeError', () => {
    expect(removeDuplicates({ error: 'Server error' })).toEqual([]);
    expect(removeDuplicates('not an array')).toEqual([]);
    expect(removeDuplicates(42)).toEqual([]);
  });

  it('deduplicates items sharing the same membershipId', () => {
    const data = [
      { membershipId: '101', name: 'Alice' },
      { membershipId: '102', name: 'Bob' },
      { membershipId: '101', name: 'Alice Duplicate' },
    ];
    const result = removeDuplicates(data);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('does not drop distinct makers whose membershipId is undefined or null', () => {
    const data = [
      { name: 'Maker One' },
      { name: 'Maker Two' },
      { name: 'Maker Three' },
    ];
    const result = removeDuplicates(data);
    expect(result.length).toBe(3);
    expect(result.map(m => m.name)).toEqual(['Maker One', 'Maker Two', 'Maker Three']);
  });

  it('deduplicates makers by id or name if membershipId is absent', () => {
    const data = [
      { id: 'usr-1', name: 'Guest 1' },
      { id: 'usr-2', name: 'Guest 2' },
      { id: 'usr-1', name: 'Guest 1 Dup' },
    ];
    const result = removeDuplicates(data);
    expect(result.length).toBe(2);
  });
});

