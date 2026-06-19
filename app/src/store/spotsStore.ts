import { create } from 'zustand';

import { createSpotRepository } from '@/data/repositories';
import type { SpotRepository } from '@/data/SpotRepository';
import type { Result } from '@/data/result';
import { rankingToFeedItem } from '@/domain/feedItem';
import type { NewSpot, Preferences, Spot } from '@/domain/models';
import { applyRankScores, sortByScoreDesc } from '@/domain/ranking';
import { useFeedStore } from '@/store/feedStore';
import { useProfileStore } from '@/store/profileStore';

/** The single seam to data. Swap this for a backed repository later — store/screens unchanged. */
const repo: SpotRepository = createSpotRepository();

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
  saveSpot: (spot: Spot) => Promise<void>;
  unsaveSpot: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  /**
   * Place a spot at rank `index` in your ranked list ("mine"); 0 = top. Order is
   * the source of truth — every spot's score is re-derived from its position.
   * Ranking a spot promotes it out of "saved".
   */
  rankSpot: (spot: Spot, index: number) => void;
  /** Reorder the ranked list to a new order (e.g. after drag) and re-derive scores. */
  reorderMine: (ordered: Spot[]) => void;
  /** Create a brand-new spot (id from the repo), then rank it at `index`. */
  addSpot: (draft: NewSpot, index: number) => Promise<Result<Spot>>;
  /** The user's own characteristic endorsements, keyed by spot id then characteristic id. */
  endorsements: Record<string, Record<string, boolean>>;
  toggleEndorsement: (spotId: string, characteristicId: string) => void;
}

export const useSpotsStore = create<SpotsState>((set, get) => ({
  collection: 'local',
  local: [],
  mine: [],
  saved: [],
  preferences: { maxDistanceMi: 5, nonNegotiables: [] },
  loaded: false,
  error: null,
  endorsements: {},

  load: async () => {
    const [localRes, mineRes, savedRes] = await Promise.all([
      repo.listLocal(),
      repo.listMine(),
      repo.listSaved(),
    ]);
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
    const saved = savedRes.ok ? savedRes.value.items : [];
    set({ local: localRes.value.items, mine, saved, loaded: true, error: null });
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

  saveSpot: async (spot) => {
    // Invariant: a spot is in at most one of saved/mine. Already-ranked or
    // already-saved spots are left alone (saved ∩ mine stays empty).
    const s = get();
    const exists = s.saved.some((m) => m.id === spot.id) || s.mine.some((m) => m.id === spot.id);
    if (exists) return;
    const res = await repo.saveSpot(spot.id);
    if (res.ok) set((st) => ({ saved: [...st.saved, spot] }));
  },

  unsaveSpot: async (id) => {
    const res = await repo.unsaveSpot(id);
    if (res.ok) set((s) => ({ saved: s.saved.filter((m) => m.id !== id) }));
  },

  isSaved: (id) => get().saved.some((m) => m.id === id),

  rankSpot: (spot, index) => {
    const s = get();
    const isFirstTime = !s.mine.some((m) => m.id === spot.id);
    const without = s.mine.filter((m) => m.id !== spot.id);
    const clamped = Math.max(0, Math.min(without.length, index));
    const mine = applyRankScores([...without.slice(0, clamped), spot, ...without.slice(clamped)]);
    set({ mine, saved: s.saved.filter((m) => m.id !== spot.id) });
    // Only a spot's first ranking is feed-worthy — re-ranks and drags stay quiet.
    if (isFirstTime) {
      const ranked = mine.find((m) => m.id === spot.id);
      if (ranked)
        useFeedStore
          .getState()
          .prepend(rankingToFeedItem(useProfileStore.getState().member, ranked, clamped + 1));
    }
  },

  reorderMine: (ordered) => set(() => ({ mine: applyRankScores(ordered) })),

  addSpot: async (draft, index) => {
    const res = await repo.createSpot(draft);
    if (res.ok) get().rankSpot(res.value, index);
    return res;
  },

  toggleEndorsement: (spotId, characteristicId) =>
    set((s) => {
      const current = s.endorsements[spotId] ?? {};
      return {
        endorsements: {
          ...s.endorsements,
          [spotId]: { ...current, [characteristicId]: !current[characteristicId] },
        },
      };
    }),
}));
