import { vouchCount } from '../vouch';

describe('vouchCount', () => {
  it('is deterministic for the same spot + characteristic', () => {
    expect(vouchCount('pontoon', 'aux')).toBe(vouchCount('pontoon', 'aux'));
  });

  it('stays within the 3–18 range', () => {
    for (const spot of ['pontoon', 'basement', 'rooftop']) {
      for (const ch of ['aux', 'free', 'water', 'cannabis']) {
        const n = vouchCount(spot, ch);
        expect(n).toBeGreaterThanOrEqual(3);
        expect(n).toBeLessThanOrEqual(18);
      }
    }
  });
});
