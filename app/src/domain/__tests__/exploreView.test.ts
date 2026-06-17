import { crewSpots, exploreCatalog, nearbySpots } from '../exploreView';
import { makeSpot } from '../../test-utils/factories';

describe('exploreCatalog', () => {
  it('unions local and mine, de-duping by id (local wins)', () => {
    const local = [makeSpot({ id: 'a' }), makeSpot({ id: 'b' })];
    const mine = [makeSpot({ id: 'b' }), makeSpot({ id: 'c' })];
    expect(exploreCatalog(local, mine).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('nearbySpots', () => {
  it('keeps only open spots within the distance limit, closest first', () => {
    const catalog = [
      makeSpot({ id: 'far', access: 'open', distanceMi: 9 }),
      makeSpot({ id: 'close', access: 'open', distanceMi: 1 }),
      makeSpot({ id: 'mid', access: 'open', distanceMi: 4 }),
      makeSpot({ id: 'friendsOnly', access: 'friends', distanceMi: 2 }),
    ];
    expect(nearbySpots(catalog, 5).map((s) => s.id)).toEqual(['close', 'mid']);
  });

  it('is strict — a spot exactly at the limit is included, just past it is not', () => {
    const catalog = [
      makeSpot({ id: 'at', access: 'open', distanceMi: 5 }),
      makeSpot({ id: 'past', access: 'open', distanceMi: 5.1 }),
    ];
    expect(nearbySpots(catalog, 5).map((s) => s.id)).toEqual(['at']);
  });

  it('drops spots that lack every non-negotiable characteristic', () => {
    const catalog = [
      makeSpot({ id: 'has', access: 'open', distanceMi: 1, characteristicIds: ['aux', 'free'] }),
      makeSpot({ id: 'missing', access: 'open', distanceMi: 1, characteristicIds: ['aux'] }),
    ];
    expect(nearbySpots(catalog, 5, ['aux', 'free']).map((s) => s.id)).toEqual(['has']);
  });
});

describe('crewSpots', () => {
  it('keeps friends- and invite-only spots, closest first, ignoring the distance cap', () => {
    const catalog = [
      makeSpot({ id: 'open', access: 'open', distanceMi: 1 }),
      makeSpot({ id: 'invite', access: 'invite', distanceMi: 8 }),
      makeSpot({ id: 'friends', access: 'friends', distanceMi: 2 }),
    ];
    expect(crewSpots(catalog).map((s) => s.id)).toEqual(['friends', 'invite']);
  });

  it('also honors non-negotiables', () => {
    const catalog = [
      makeSpot({ id: 'has', access: 'friends', distanceMi: 1, characteristicIds: ['dog'] }),
      makeSpot({ id: 'missing', access: 'friends', distanceMi: 2, characteristicIds: [] }),
    ];
    expect(crewSpots(catalog, ['dog']).map((s) => s.id)).toEqual(['has']);
  });
});
