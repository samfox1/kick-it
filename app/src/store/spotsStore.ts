import { create } from 'zustand';

import { createDefaultSpotRepository } from '@/data/mock/seed';
import type { SpotRepository } from '@/data/SpotRepository';
import type { Preferences, Spot } from '@/domain/models';

/** The single seam to data. Swap this for a backed repository later — store/screens unchanged. */
const repo: SpotRepository = createDefaultSpotRepository();

export type Collection = 'local' | 'mine';

interface SpotsState {
  collection: Collection;
  local: Spot[];
  mine: Spot[];
  /** Spots you've bookmarked (swipe-right / bookmark) — your "want to kick it" list. */
  saved: Spot[];
  preferences: Preferences;
  loaded: boolean;
  /** Set when the last load failed, so the UI can show/retry. Null on success. */
  error: string | null;
  load: () => Promise<void>;
  setCollection: (c: Collection) => void;
  setMaxDistance: (mi: number) => void;
  toggleNonNegotiable: (id: string) => void;
  saveSpot: (spot: Spot) => void;
  unsaveSpot: (id: string) => void;
  isSaved: (id: string) => boolean;
  /**
   * Add or update a spot in your ranked list ("mine") with a derived score.
   * Ranking a spot promotes it out of "saved" — once it's ranked it lives in My spots.
   */
  rankSpot: (spot: Spot, score: number) => void;
}

export const useSpotsStore = create<SpotsState>((set, get) => ({
  collection: 'local',
  local: [],
  mine: [],
  saved: [],
  preferences: { maxDistanceMi: 5, nonNegotiables: [] },
  loaded: false,
  error: null,

  load: async () => {
    const [localRes, mineRes] = await Promise.all([repo.listLocal(), repo.listMine()]);
    if (!localRes.ok) {
      set({ loaded: true, error: localRes.error.message });
      return;
    }
    if (!mineRes.ok) {
      set({ loaded: true, error: mineRes.error.message });
      return;
    }
    set({ local: localRes.value.items, mine: mineRes.value.items, loaded: true, error: null });
  },

  setCollection: (collection) => set({ collection }),

  setMaxDistance: (mi) => set((s) => ({ preferences: { ...s.preferences, maxDistanceMi: mi } })),

  toggleNonNegotiable: (id) =>
    set((s) => {
      const has = s.preferences.nonNegotiables.includes(id);
      const nonNegotiables = has
        ? s.preferences.nonNegotiables.filter((x) => x !== id)
        : [...s.preferences.nonNegotiables, id];
      return { preferences: { ...s.preferences, nonNegotiables } };
    }),

  saveSpot: (spot) =>
    set((s) => (s.saved.some((m) => m.id === spot.id) ? s : { saved: [...s.saved, spot] })),

  unsaveSpot: (id) => set((s) => ({ saved: s.saved.filter((m) => m.id !== id) })),

  isSaved: (id) => get().saved.some((m) => m.id === id),

  rankSpot: (spot, score) =>
    set((s) => ({
      mine: [...s.mine.filter((m) => m.id !== spot.id), { ...spot, score }],
      saved: s.saved.filter((m) => m.id !== spot.id),
    })),
}));
