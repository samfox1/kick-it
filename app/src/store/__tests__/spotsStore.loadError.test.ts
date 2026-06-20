import type { SpotRepository } from '@/data/SpotRepository';

import { useSpotsStore } from '../spotsStore';

// Repo whose local listing fails, to exercise the store's error path.
jest.mock('@/data/mock/seed', () => {
  const repo: SpotRepository = {
    listLocal: async () => ({ ok: false, error: { code: 'network', message: 'offline' } }),
    listMine: async () => ({ ok: true, value: { items: [] } }),
    getById: async () => ({ ok: true, value: undefined }),
    createSpot: async () => ({ ok: false, error: { code: 'unknown', message: 'n/a' } }),
    listSaved: async () => ({ ok: true, value: { items: [] } }),
    saveSpot: async () => ({ ok: true, value: undefined }),
    unsaveSpot: async () => ({ ok: true, value: undefined }),
    setRanking: async () => ({ ok: true, value: undefined }),
  };
  return { createDefaultSpotRepository: () => repo, SEED: { local: [], mine: [] } };
});

describe('spotsStore.load error handling', () => {
  it('records the error and clears stale collections (no cross-identity leak)', async () => {
    // Seed a previous identity's spots, then fail a load — none should remain.
    useSpotsStore.setState({
      local: [{ id: 'old' } as never],
      mine: [{ id: 'old' } as never],
      saved: [{ id: 'old' } as never],
    });
    await useSpotsStore.getState().load();
    expect(useSpotsStore.getState().error).toBe('offline');
    expect(useSpotsStore.getState().loaded).toBe(true);
    expect(useSpotsStore.getState().local).toEqual([]);
    expect(useSpotsStore.getState().mine).toEqual([]);
    expect(useSpotsStore.getState().saved).toEqual([]);
  });

  it('reset() clears every per-user collection', () => {
    useSpotsStore.setState({
      mine: [{ id: 'a' } as never],
      saved: [{ id: 'b' } as never],
      endorsements: { a: { aux: true } },
    });
    useSpotsStore.getState().reset();
    expect(useSpotsStore.getState().mine).toEqual([]);
    expect(useSpotsStore.getState().saved).toEqual([]);
    expect(useSpotsStore.getState().endorsements).toEqual({});
  });
});
