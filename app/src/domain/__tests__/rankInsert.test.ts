import { insertIndex, nextComparisonIndex } from '../rankInsert';

describe('nextComparisonIndex (binary search over a ranked list)', () => {
  it('starts by comparing against the middle', () => {
    expect(nextComparisonIndex(4, [])).toBe(2);
  });

  it('narrows the range with each answer', () => {
    expect(nextComparisonIndex(4, ['better'])).toBe(1); // better than middle → search upper half
  });

  it('returns -1 when the position is resolved', () => {
    expect(nextComparisonIndex(4, ['better', 'worse'])).toBe(-1);
  });

  it('needs no comparisons for an empty list', () => {
    expect(nextComparisonIndex(0, [])).toBe(-1);
  });
});

describe('insertIndex', () => {
  it('resolves to the final slot from the answers', () => {
    expect(insertIndex(4, ['better', 'worse'])).toBe(2);
  });

  it('places at the top when always better', () => {
    expect(insertIndex(4, ['better', 'better'])).toBe(0);
  });

  it('places at the bottom when always worse', () => {
    expect(insertIndex(4, ['worse', 'worse'])).toBe(4);
  });
});
