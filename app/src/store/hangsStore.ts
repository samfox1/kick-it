import { create } from 'zustand';

import { HANGS } from '@/data/mock/hangSeed';
import { createHangRepository, usingSupabase } from '@/data/repositories';
import type { Hang, NewHang, ReactionKey } from '@/domain/models';
import { hangToFeedItem } from '@/domain/feedItem';
import type { Result } from '@/data/result';
import { useFeedStore } from '@/store/feedStore';
import { useSpotsStore } from '@/store/spotsStore';

const repo = createHangRepository();

/** Merge fetched hangs into the cache, fetched first, de-duped by id. */
function mergeHangs(existing: Hang[], incoming: Hang[]): Hang[] {
  const incomingIds = new Set(incoming.map((h) => h.id));
  return [...incoming, ...existing.filter((h) => !incomingIds.has(h.id))];
}

/** Mutable store of logged hangs. On Supabase it loads per-spot / mine from the repo;
 *  the mock seeds everything up front. Screens filter `hangs` by spot or author. */
interface HangsState {
  hangs: Hang[];
  /**
   * The current user's reactions, keyed by hang id then reaction. Lives in the
   * store (not component state) so a reaction survives unmount and shows the same
   * on both the profile and the spot's ledger. Not persisted yet (see TODO).
   */
  reactions: Record<string, Partial<Record<ReactionKey, boolean>>>;
  /** Load a spot's ledger into the cache. */
  loadForSpot: (spotId: string) => Promise<void>;
  /** Load the current user's own hangs into the cache. */
  loadMine: () => Promise<void>;
  /** Load the current user's reactions from the backend. */
  loadMyReactions: () => Promise<void>;
  deleteHang: (id: string) => Promise<void>;
  updateHang: (id: string, patch: { title?: string; note?: string }) => Promise<void>;
  toggleReaction: (hangId: string, key: ReactionKey) => void;
  /** Log a new hang: persists via the repo, prepends to the ledger, and posts to the feed. */
  logHang: (draft: NewHang) => Promise<Result<Hang>>;
}

export const useHangsStore = create<HangsState>((set, get) => ({
  hangs: usingSupabase ? [] : [...HANGS],
  reactions: {},

  loadForSpot: async (spotId) => {
    const res = await repo.listForSpot(spotId);
    if (res.ok) set((s) => ({ hangs: mergeHangs(s.hangs, res.value.items) }));
  },

  loadMine: async () => {
    const res = await repo.listMine();
    if (res.ok) set((s) => ({ hangs: mergeHangs(s.hangs, res.value.items) }));
  },

  loadMyReactions: async () => {
    const res = await repo.listMyReactions();
    if (res.ok) set((s) => ({ reactions: { ...s.reactions, ...res.value } }));
  },

  deleteHang: async (id) => {
    set((s) => {
      const { [id]: _removed, ...reactions } = s.reactions;
      return { hangs: s.hangs.filter((h) => h.id !== id), reactions };
    });
    await repo.deleteHang(id);
  },

  updateHang: async (id, patch) => {
    set((s) => ({ hangs: s.hangs.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
    await repo.updateHang(id, patch);
  },

  toggleReaction: (hangId, key) => {
    const on = !(get().reactions[hangId]?.[key] ?? false);
    set((s) => ({
      reactions: { ...s.reactions, [hangId]: { ...(s.reactions[hangId] ?? {}), [key]: on } },
    }));
    void repo.setReaction(hangId, key, on);
  },

  logHang: async (draft) => {
    const res = await repo.logHang(draft);
    if (res.ok) {
      set((s) => ({ hangs: [res.value, ...s.hangs] }));
      // Post to the feed only if we can resolve the real spot — never guess its name/access.
      const { mine, saved, local } = useSpotsStore.getState();
      const spot = [...mine, ...saved, ...local].find((s) => s.id === res.value.spotId);
      if (spot) useFeedStore.getState().prepend(hangToFeedItem(res.value, spot));
    }
    return res;
  },
}));
