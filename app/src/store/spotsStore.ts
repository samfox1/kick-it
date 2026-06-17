import { create } from 'zustand';

import { createDefaultSpotRepository } from '@/data/mock/seed';
import type { SpotRepository } from '@/data/SpotRepository';
import type { Preferences, Spot } from '@/domain/models';
import { applyRankScores, sortByScoreDesc } from '@/domain/ranking';

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
   * Place a spot at rank `index` in your ranked list ("mine"); 0 = top. Order is
   * the source of truth — every spot's score is re-derived from its position.
   * Ranking a spot promotes it out of "saved".
   */
  rankSpot: (spot: Spot, index: number) => void;
  /** Reorder the ranked list to a new order (e.g. after drag) and re-derive scores. */
  reorderMine: (ordered: Spot[]) => void;
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
    // Establish rank order from the seed's scores, then derive clean band scores so
    // the order-as-truth model is consistent from the first render.
    const mine = applyRankScores(sortByScoreDesc(mineRes.value.items));
    set({ local: localRes.value.items, mine, loaded: true, error: null });
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
    set((s) => {
      // Invariant: a spot is in at most one of saved/mine. Already-ranked or
      // already-saved spots are left alone (saved ∩ mine stays empty).
      const exists = s.saved.some((m) => m.id === spot.id) || s.mine.some((m) => m.id === spot.id);
      return exists ? s : { saved: [...s.saved, spot] };
    }),

  unsaveSpot: (id) => set((s) => ({ saved: s.saved.filter((m) => m.id !== id) })),

  isSaved: (id) => get().saved.some((m) => m.id === id),

  rankSpot: (spot, index) =>
    set((s) => {
      const without = s.mine.filter((m) => m.id !== spot.id);
      const clamped = Math.max(0, Math.min(without.length, index));
      const next = [...without.slice(0, clamped), spot, ...without.slice(clamped)];
      return { mine: applyRankScores(next), saved: s.saved.filter((m) => m.id !== spot.id) };
    }),

  reorderMine: (ordered) => set(() => ({ mine: applyRankScores(ordered) })),
}));
