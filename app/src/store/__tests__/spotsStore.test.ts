import { useSpotsStore } from '../spotsStore';
import { makeSpot } from '../../test-utils/factories';

describe('spotsStore saved collection', () => {
  beforeEach(() => useSpotsStore.setState({ saved: [], mine: [] }));

  it('saveSpot adds a spot to your saved collection', () => {
    useSpotsStore.getState().saveSpot(makeSpot({ id: 'a' }));
    expect(useSpotsStore.getState().saved.map((s) => s.id)).toEqual(['a']);
  });

  it('saveSpot is idempotent', () => {
    const spot = makeSpot({ id: 'a' });
    useSpotsStore.getState().saveSpot(spot);
    useSpotsStore.getState().saveSpot(spot);
    expect(useSpotsStore.getState().saved).toHaveLength(1);
  });

  it('unsaveSpot removes it', () => {
    useSpotsStore.getState().saveSpot(makeSpot({ id: 'a' }));
    useSpotsStore.getState().unsaveSpot('a');
    expect(useSpotsStore.getState().saved).toEqual([]);
  });

  it('isSaved reflects membership', () => {
    expect(useSpotsStore.getState().isSaved('a')).toBe(false);
    useSpotsStore.getState().saveSpot(makeSpot({ id: 'a' }));
    expect(useSpotsStore.getState().isSaved('a')).toBe(true);
  });

  it('saveSpot is a no-op for an already-ranked spot (saved ∩ mine stays empty)', () => {
    useSpotsStore.setState({ mine: [makeSpot({ id: 'a' })] });
    useSpotsStore.getState().saveSpot(makeSpot({ id: 'a' }));
    expect(useSpotsStore.getState().saved).toEqual([]);
  });
});

describe('spotsStore.rankSpot', () => {
  beforeEach(() => useSpotsStore.setState({ mine: [], saved: [] }));

  it('inserts a spot at the given rank index and derives its score', () => {
    useSpotsStore.setState({ mine: [makeSpot({ id: 'a' }), makeSpot({ id: 'b' })] });
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'new' }), 1);
    const mine = useSpotsStore.getState().mine;
    expect(mine.map((s) => s.id)).toEqual(['a', 'new', 'b']);
    // Scores are derived from position and strictly descending with rank.
    expect(mine[0].score).toBeGreaterThan(mine[1].score);
    expect(mine[1].score).toBeGreaterThan(mine[2].score);
  });

  it('re-ranks an existing spot to a new position (no duplicate)', () => {
    useSpotsStore.setState({
      mine: [makeSpot({ id: 'a' }), makeSpot({ id: 'b' }), makeSpot({ id: 'c' })],
    });
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'c' }), 0); // move c to the top
    expect(useSpotsStore.getState().mine.map((s) => s.id)).toEqual(['c', 'a', 'b']);
  });

  it('promotes a saved spot out of saved when ranked', () => {
    const spot = makeSpot({ id: 'a' });
    useSpotsStore.setState({ mine: [], saved: [spot] });
    useSpotsStore.getState().rankSpot(spot, 0);
    expect(useSpotsStore.getState().saved.map((s) => s.id)).not.toContain('a');
    expect(useSpotsStore.getState().mine.map((s) => s.id)).toContain('a');
  });

  it('leaves saved untouched when ranking a spot that was never saved', () => {
    const saved = makeSpot({ id: 'keep' });
    useSpotsStore.setState({ mine: [], saved: [saved] });
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'other' }), 0);
    expect(useSpotsStore.getState().saved.map((s) => s.id)).toEqual(['keep']);
  });
});

describe('spotsStore.reorderMine', () => {
  it('applies the new order exactly and re-derives descending scores (no drift)', () => {
    const spots = [
      makeSpot({ id: 'a' }),
      makeSpot({ id: 'b' }),
      makeSpot({ id: 'c' }),
      makeSpot({ id: 'd' }),
    ];
    useSpotsStore.setState({ mine: spots });
    // Drag d to the front: new visual order [d, a, b, c].
    const reordered = [spots[3], spots[0], spots[1], spots[2]];
    useSpotsStore.getState().reorderMine(reordered);
    const mine = useSpotsStore.getState().mine;
    expect(mine.map((s) => s.id)).toEqual(['d', 'a', 'b', 'c']);
    for (let i = 1; i < mine.length; i++) {
      expect(mine[i].score).toBeLessThan(mine[i - 1].score);
    }
  });
});

describe('spotsStore edge cases', () => {
  beforeEach(() => useSpotsStore.setState({ saved: [], mine: [] }));

  it('unsaveSpot on an unknown id is a safe no-op', () => {
    useSpotsStore.setState({ saved: [makeSpot({ id: 'a' })] });
    useSpotsStore.getState().unsaveSpot('missing');
    expect(useSpotsStore.getState().saved.map((s) => s.id)).toEqual(['a']);
  });
});
