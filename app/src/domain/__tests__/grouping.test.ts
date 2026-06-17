import { groupByCategory } from '../grouping';

describe('groupByCategory', () => {
  it('groups characteristic ids by category in canonical order', () => {
    const groups = groupByCategory(['free', 'aux', 'water', 'cannabis']);
    expect(groups.map((g) => g.category)).toEqual(['outdoors', 'vibe', 'features', 'access']);
    expect(groups.map((g) => g.items.map((c) => c.id))).toEqual([
      ['water'],
      ['cannabis'],
      ['aux'],
      ['free'],
    ]);
  });

  it('omits categories with no items', () => {
    const groups = groupByCategory(['aux', 'charging']);
    expect(groups.map((g) => g.category)).toEqual(['features']);
  });

  it('skips unknown ids', () => {
    expect(groupByCategory(['nope', 'water'])).toEqual([
      expect.objectContaining({ category: 'outdoors' }),
    ]);
  });

  it('returns nothing for an empty list', () => {
    expect(groupByCategory([])).toEqual([]);
  });
});
