import { topEndorsed, vouchCount } from '../vouch';

describe('topEndorsed', () => {
  const ids = ['aux', 'wifi', 'free', 'dog', 'view', 'loud', 'sunset'];

  it('returns at most n characteristics', () => {
    expect(topEndorsed('spot-1', ids, 4)).toHaveLength(4);
  });

  it('orders by endorsement count, highest first', () => {
    const out = topEndorsed('spot-1', ids, 4);
    for (let i = 1; i < out.length; i++) {
      expect(vouchCount('spot-1', out[i - 1])).toBeGreaterThanOrEqual(vouchCount('spot-1', out[i]));
    }
  });

  it('only returns ids it was given, and not more than exist', () => {
    const out = topEndorsed('spot-1', ['aux', 'wifi'], 4);
    expect(out).toHaveLength(2);
    out.forEach((id) => expect(['aux', 'wifi']).toContain(id));
  });
});
