import { create } from 'zustand';

import { HANGS } from '@/data/mock/hangSeed';
import { createHangRepository, usingSupabase } from '@/data/repositories';
import type { Hang, NewHang, ReactionKey } from '@/domain/models';
import { hangToFeedItem } from '@/domain/feedItem';
import type { Result } from '@/data/result';
import { reportFailure } from '@/store/optimistic';
import { useFeedStore } from '@/store/feedStore';
import { useProfileStore } from '@/store/profileStore';
import { useSpotsStore } from '@/store/spotsStore';

const repo = createHangRepository();

/**
 * Replace every cached hang within a scope (e.g. one spot's ledger, or your own hangs)
 * with the freshly-fetched set, keeping out-of-scope hangs untouched. Authoritative within
 * the scope, so server deletes/edits actually propagate on reload (a plain union can't).
 */
export function replaceScope(
  existing: Hang[],
  incoming: Hang[],
  inScope: (h: Hang) => boolean,
): Hang[] {
  return [...incoming, ...existing.filter((h) => !inScope(h))];
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
  /** Clear the cache (e.g. on an identity change). */
  reset: () => void;
}

export const useHangsStore = create<HangsState>((set, get) => ({
  hangs: usingSupabase ? [] : [...HANGS],
  reactions: {},

  loadForSpot: async (spotId) => {
    const res = await repo.listForSpot(spotId);
    if (res.ok)
      set((s) => ({ hangs: replaceScope(s.hangs, res.value.items, (h) => h.spotId === spotId) }));
  },

  loadMine: async () => {
    const res = await repo.listMine();
    if (!res.ok) return;
    const meId = useProfileStore.getState().member.id;
    set((s) => ({ hangs: replaceScope(s.hangs, res.value.items, (h) => h.author.id === meId) }));
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
    reportFailure('deleteHang', await repo.deleteHang(id));
  },

  updateHang: async (id, patch) => {
    set((s) => ({ hangs: s.hangs.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
    reportFailure('updateHang', await repo.updateHang(id, patch));
  },

  toggleReaction: (hangId, key) => {
    const on = !(get().reactions[hangId]?.[key] ?? false);
    set((s) => ({
      reactions: { ...s.reactions, [hangId]: { ...(s.reactions[hangId] ?? {}), [key]: on } },
    }));
    void repo.setReaction(hangId, key, on).then((res) => reportFailure('setReaction', res));
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

  reset: () => set({ hangs: [], reactions: {} }),
}));
