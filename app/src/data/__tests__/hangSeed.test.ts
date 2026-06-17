import { HANGS, createDefaultHangRepository } from '../mock/hangSeed';

describe('hang seed integrity', () => {
  it('has hangs with non-negative likes', () => {
    expect(HANGS.length).toBeGreaterThan(0);
    for (const h of HANGS) expect(h.likes).toBeGreaterThanOrEqual(0);
  });

  it('default repository returns a spot’s hangs', async () => {
    const repo = createDefaultHangRepository();
    const pontoon = await repo.listForSpot('pontoon');
    expect(pontoon.length).toBeGreaterThanOrEqual(2);
    expect(pontoon.every((h) => h.spotId === 'pontoon')).toBe(true);
  });
});
