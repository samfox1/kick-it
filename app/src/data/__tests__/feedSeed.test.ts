import { getCharacteristic } from '../../domain/characteristics';
import { unwrap } from '../../test-utils/result';
import { FEED, createDefaultFeedRepository } from '../mock/feedSeed';

describe('feed seed integrity', () => {
  it('has feed items', () => {
    expect(FEED.length).toBeGreaterThan(0);
  });

  it('new_spot items reference real characteristics and a valid score', () => {
    for (const item of FEED) {
      if (item.kind !== 'new_spot') continue;
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(10);
      for (const id of item.characteristicIds) {
        expect(getCharacteristic(id)).toBeDefined();
      }
    }
  });

  it('exposes a default repository over the seed', async () => {
    const repo = createDefaultFeedRepository();
    expect(unwrap(await repo.listFeed()).items.length).toBe(FEED.length);
  });
});
