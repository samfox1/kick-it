import { visibleLocalSpots, visibleMySpots } from '../spotsView';
import { makeSpot } from '../../test-utils/factories';

describe('visibleLocalSpots', () => {
  it('filters by preferences then orders by score descending', () => {
    const spots = [
      makeSpot({ id: 'near-hi', distanceMi: 1, score: 9, characteristicIds: ['aux'] }),
      makeSpot({ id: 'near-lo', distanceMi: 1, score: 6, characteristicIds: ['aux'] }),
      makeSpot({ id: 'far', distanceMi: 30, score: 10, characteristicIds: ['aux'] }),
      makeSpot({ id: 'missing', distanceMi: 1, score: 8, characteristicIds: [] }),
    ];
    const result = visibleLocalSpots(spots, { maxDistanceMi: 5, nonNegotiables: ['aux'] });
    expect(result.map((s) => s.id)).toEqual(['near-hi', 'near-lo']);
  });
});

describe('visibleMySpots', () => {
  it('returns spots in their existing rank order (array order is the ranking)', () => {
    const spots = [makeSpot({ id: 'a', score: 7 }), makeSpot({ id: 'b', score: 9 })];
    expect(visibleMySpots(spots).map((s) => s.id)).toEqual(['a', 'b']);
  });
});
