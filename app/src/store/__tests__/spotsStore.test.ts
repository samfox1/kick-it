import { useSpotsStore } from '../spotsStore';
import { makeSpot } from '../../test-utils/factories';

describe('spotsStore saved collection', () => {
  beforeEach(() => useSpotsStore.setState({ saved: [] }));

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
});

describe('spotsStore.rankSpot', () => {
  beforeEach(() => useSpotsStore.setState({ mine: [] }));

  it('adds a newly ranked spot to your ranked list with the given score', () => {
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'a', score: 0 }), 8.5);
    const a = useSpotsStore.getState().mine.find((s) => s.id === 'a');
    expect(a?.score).toBe(8.5);
  });

  it('re-ranks an existing spot in place (no duplicate)', () => {
    useSpotsStore.setState({ mine: [makeSpot({ id: 'a', score: 5 })] });
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'a' }), 9.1);
    const mine = useSpotsStore.getState().mine.filter((s) => s.id === 'a');
    expect(mine).toHaveLength(1);
    expect(mine[0].score).toBe(9.1);
  });

  it('promotes a saved spot out of saved when ranked', () => {
    const spot = makeSpot({ id: 'a' });
    useSpotsStore.setState({ mine: [], saved: [spot] });
    useSpotsStore.getState().rankSpot(spot, 7.2);
    expect(useSpotsStore.getState().saved.map((s) => s.id)).not.toContain('a');
    expect(useSpotsStore.getState().mine.map((s) => s.id)).toContain('a');
  });

  it('leaves saved untouched when ranking a spot that was never saved', () => {
    const saved = makeSpot({ id: 'keep' });
    useSpotsStore.setState({ mine: [], saved: [saved] });
    useSpotsStore.getState().rankSpot(makeSpot({ id: 'other' }), 6);
    expect(useSpotsStore.getState().saved.map((s) => s.id)).toEqual(['keep']);
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
