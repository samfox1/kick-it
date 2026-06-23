import { applyRankScores, scoreFromRank, sortByScoreDesc } from '../ranking';
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

describe('scoreFromRank', () => {
  it('gives the single spot the top score', () => {
    expect(scoreFromRank(0, 1)).toBe(9.6);
  });

  it('puts #1 at the top and the last at the bottom of the band', () => {
    expect(scoreFromRank(0, 5)).toBe(9.6);
    expect(scoreFromRank(4, 5)).toBe(6.5);
  });

  it('decreases monotonically with rank', () => {
    const scores = [0, 1, 2, 3, 4].map((i) => scoreFromRank(i, 5));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1]);
    }
  });
});

describe('applyRankScores', () => {
  it('re-derives scores from position, preserving order', () => {
    const out = applyRankScores([
      makeSpot({ id: 'a', score: 1 }),
      makeSpot({ id: 'b', score: 2 }),
      makeSpot({ id: 'c', score: 3 }),
    ]);
    expect(out.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(out[0].score).toBe(9.6);
    expect(out[2].score).toBe(6.5);
    expect(out[0].score).toBeGreaterThan(out[1].score);
  });
});
