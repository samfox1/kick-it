import { filterSpots } from '../preferences';
import { makeSpot } from '../../test-utils/factories';

describe('filterSpots', () => {
  it('excludes spots beyond the max distance', () => {
    const spots = [makeSpot({ id: 'near', distanceMi: 2 }), makeSpot({ id: 'far', distanceMi: 9 })];
    const result = filterSpots(spots, { maxDistanceMi: 5, nonNegotiables: [] });
    expect(result.map((s) => s.id)).toEqual(['near']);
  });

  it('keeps spots exactly at the max distance', () => {
    const spots = [makeSpot({ id: 'edge', distanceMi: 5 })];
    expect(filterSpots(spots, { maxDistanceMi: 5, nonNegotiables: [] })).toHaveLength(1);
  });

  it('requires every non-negotiable characteristic to be present', () => {
    const spots = [
      makeSpot({ id: 'has-both', characteristicIds: ['aux', 'free'] }),
      makeSpot({ id: 'has-one', characteristicIds: ['aux'] }),
    ];
    const result = filterSpots(spots, { maxDistanceMi: 50, nonNegotiables: ['aux', 'free'] });
    expect(result.map((s) => s.id)).toEqual(['has-both']);
  });

  it('applies only the distance filter when there are no non-negotiables', () => {
    const spots = [makeSpot({ id: 'a', distanceMi: 1, characteristicIds: [] })];
    expect(filterSpots(spots, { maxDistanceMi: 5, nonNegotiables: [] })).toHaveLength(1);
  });

  it('combines distance and non-negotiables', () => {
    const spots = [
      makeSpot({ id: 'near-has', distanceMi: 1, characteristicIds: ['aux'] }),
      makeSpot({ id: 'far-has', distanceMi: 20, characteristicIds: ['aux'] }),
      makeSpot({ id: 'near-missing', distanceMi: 1, characteristicIds: [] }),
    ];
    const result = filterSpots(spots, { maxDistanceMi: 5, nonNegotiables: ['aux'] });
    expect(result.map((s) => s.id)).toEqual(['near-has']);
  });

  it('does not mutate the input array', () => {
    const spots = [makeSpot({ id: 'a', distanceMi: 99 })];
    filterSpots(spots, { maxDistanceMi: 1, nonNegotiables: [] });
    expect(spots).toHaveLength(1);
  });
});
