import { SEED, createDefaultSpotRepository } from '../mock/seed';
import { getCharacteristic } from '../../domain/characteristics';
import type { Spot } from '../../domain/models';
import { unwrap } from '../../test-utils/result';

const allSpots: Spot[] = [...SEED.local, ...SEED.mine];

describe('seed data integrity', () => {
  it('has local and mine spots', () => {
    expect(SEED.local.length).toBeGreaterThan(0);
    expect(SEED.mine.length).toBeGreaterThan(0);
  });

  it('every score is within 0–10 and distance is non-negative', () => {
    for (const s of allSpots) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(10);
      expect(s.distanceMi).toBeGreaterThanOrEqual(0);
    }
  });

  it('every characteristic id exists in the catalog', () => {
    for (const s of allSpots) {
      for (const id of s.characteristicIds) {
        expect(getCharacteristic(id)).toBeDefined();
      }
    }
  });

  it('exposes a default repository over the seed', async () => {
    const repo = createDefaultSpotRepository();
    expect(unwrap(await repo.listLocal()).items.length).toBe(SEED.local.length);
    expect(unwrap(await repo.getById('pontoon'))?.name).toBe("Uncle Rick's Pontoon");
  });
});
