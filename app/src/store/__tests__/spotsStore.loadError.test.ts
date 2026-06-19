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
  it('records the error message and still marks itself loaded', async () => {
    await useSpotsStore.getState().load();
    expect(useSpotsStore.getState().error).toBe('offline');
    expect(useSpotsStore.getState().loaded).toBe(true);
    expect(useSpotsStore.getState().local).toEqual([]);
  });
});
