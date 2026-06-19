// Repo whose createSpot fails, to exercise addSpot's error path.
import { useSpotsStore } from '../spotsStore';

jest.mock('@/data/mock/seed', () => {
  const actual = jest.requireActual('@/data/mock/seed');
  return {
    ...actual,
    createDefaultSpotRepository: () => ({
      listLocal: async () => ({ ok: true, value: { items: [] } }),
      listMine: async () => ({ ok: true, value: { items: [] } }),
      getById: async () => ({ ok: true, value: undefined }),
      createSpot: async () => ({ ok: false, error: { code: 'network', message: 'offline' } }),
      listSaved: async () => ({ ok: true, value: { items: [] } }),
      saveSpot: async () => ({ ok: true, value: undefined }),
      unsaveSpot: async () => ({ ok: true, value: undefined }),
      setRanking: async () => ({ ok: true, value: undefined }),
    }),
  };
});

describe('spotsStore.addSpot error handling', () => {
  it('returns the error and adds no spot on failure', async () => {
    useSpotsStore.setState({ mine: [], saved: [] });
    const res = await useSpotsStore.getState().addSpot(
      {
        name: 'X',
        category: 'c',
        access: 'open',
        distanceMi: 0,
        location: '',
        image: 'i',
        characteristicIds: [],
      },
      0,
    );
    expect(res.ok).toBe(false);
    expect(useSpotsStore.getState().mine).toHaveLength(0);
  });
});
