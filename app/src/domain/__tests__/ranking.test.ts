import { sortByScoreDesc } from '../ranking';
import { makeSpot } from '../../test-utils/factories';

describe('sortByScoreDesc', () => {
  it('orders spots highest score first', () => {
    const spots = [
      makeSpot({ id: 'a', score: 7.1 }),
      makeSpot({ id: 'b', score: 9.6 }),
      makeSpot({ id: 'c', score: 4.8 }),
    ];
    expect(sortByScoreDesc(spots).map((s) => s.id)).toEqual(['b', 'a', 'c']);
  });

  it('is stable for equal scores (keeps input order)', () => {
    const spots = [
      makeSpot({ id: 'a', score: 8 }),
      makeSpot({ id: 'b', score: 8 }),
      makeSpot({ id: 'c', score: 8 }),
    ];
    expect(sortByScoreDesc(spots).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const spots = [makeSpot({ id: 'a', score: 1 }), makeSpot({ id: 'b', score: 9 })];
    sortByScoreDesc(spots);
    expect(spots.map((s) => s.id)).toEqual(['a', 'b']);
  });
});
