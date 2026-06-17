import { insertIndex, nextComparisonIndex, scoreForInsert, scoreForReorder } from '../rankInsert';

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

describe('scoreForInsert', () => {
  const scores = [9.6, 9.2, 8.9, 8.4];

  it('scores just above the top when inserted first', () => {
    expect(scoreForInsert(scores, 0)).toBe(9.8);
  });

  it('scores just below the bottom when inserted last', () => {
    expect(scoreForInsert(scores, 4)).toBe(8.2);
  });

  it('scores the midpoint of its neighbors in the middle', () => {
    expect(scoreForInsert(scores, 2)).toBe(9.1); // between 9.2 and 8.9
  });

  it('gives a neutral score when there is nothing to compare against', () => {
    expect(scoreForInsert([], 0)).toBe(8);
  });
});

describe('scoreForReorder (drag-to-reorder)', () => {
  it('scores a dragged spot at the midpoint of its new neighbors', () => {
    expect(scoreForReorder([9, 8, 7], 1)).toBe(8); // between 9 and 7
  });

  it('scores just above the top when dragged to #1', () => {
    expect(scoreForReorder([9, 8, 7], 0)).toBeGreaterThan(8);
  });

  it('scores just below the last when dragged to the bottom', () => {
    expect(scoreForReorder([9, 8, 7], 2)).toBeLessThan(8);
  });
});
