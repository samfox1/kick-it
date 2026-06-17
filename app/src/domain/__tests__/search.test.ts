import { searchSpots } from '../search';
import { makeSpot } from '../../test-utils/factories';

const catalog = [
  makeSpot({ id: 'roof', name: "Marcus's Rooftop", location: 'Eastside', category: 'rooftop' }),
  makeSpot({ id: 'bench', name: 'Cedar Bench', location: 'Cedar Park', category: 'park' }),
];

describe('searchSpots', () => {
  it('returns nothing for an empty query', () => {
    expect(searchSpots(catalog, '   ')).toEqual([]);
  });

  it('matches the name, case-insensitively', () => {
    expect(searchSpots(catalog, 'rooftop').map((s) => s.id)).toEqual(['roof']);
  });

  it('matches location and category too', () => {
    expect(searchSpots(catalog, 'park').map((s) => s.id)).toEqual(['bench']);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchSpots(catalog, 'pontoon')).toEqual([]);
  });
});
