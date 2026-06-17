import { topEndorsed } from '../vouch';

describe('topEndorsed', () => {
  const counts = { aux: 18, wifi: 3, free: 12, dog: 7, view: 15 };
  const ids = ['aux', 'wifi', 'free', 'dog', 'view'];

  it('returns at most n characteristics', () => {
    expect(topEndorsed(counts, ids, 4)).toHaveLength(4);
  });

  it('orders by endorsement count, highest first', () => {
    expect(topEndorsed(counts, ids, 5)).toEqual(['aux', 'view', 'free', 'dog', 'wifi']);
  });

  it('treats a missing count as zero (sorts last)', () => {
    expect(topEndorsed({ aux: 5 }, ['unknown', 'aux'], 2)).toEqual(['aux', 'unknown']);
  });

  it('only returns ids it was given, and not more than exist', () => {
    const out = topEndorsed(counts, ['aux', 'wifi'], 4);
    expect(out).toHaveLength(2);
    out.forEach((id) => expect(['aux', 'wifi']).toContain(id));
  });
});
