import { create } from 'zustand';

import { HANGS, createDefaultHangRepository } from '@/data/mock/hangSeed';
import type { Hang, NewHang, ReactionKey } from '@/domain/models';
import { hangToFeedItem } from '@/domain/feedItem';
import type { Result } from '@/data/result';
import { useFeedStore } from '@/store/feedStore';
import { useSpotsStore } from '@/store/spotsStore';

const repo = createDefaultHangRepository();

/** Mutable store of all logged hangs. Swap the seed for a backend later — screens unchanged. */
interface HangsState {
  hangs: Hang[];
  /**
   * The current user's reactions, keyed by hang id then reaction. Lives in the
   * store (not component state) so a reaction survives unmount and shows the same
   * on both the profile and the spot's ledger. A backend would persist this.
   */
  reactions: Record<string, Partial<Record<ReactionKey, boolean>>>;
  deleteHang: (id: string) => void;
  updateHang: (id: string, patch: { title?: string; note?: string }) => void;
  toggleReaction: (hangId: string, key: ReactionKey) => void;
  /** Log a new hang: persists via the repo, prepends to the ledger, and posts to the feed. */
  logHang: (draft: NewHang) => Promise<Result<Hang>>;
}

export const useHangsStore = create<HangsState>((set) => ({
  hangs: [...HANGS],
  reactions: {},

  deleteHang: (id) =>
    set((s) => {
      const { [id]: _removed, ...reactions } = s.reactions;
      return { hangs: s.hangs.filter((h) => h.id !== id), reactions };
    }),

  updateHang: (id, patch) =>
    set((s) => ({ hangs: s.hangs.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),

  toggleReaction: (hangId, key) =>
    set((s) => {
      const current = s.reactions[hangId] ?? {};
      return { reactions: { ...s.reactions, [hangId]: { ...current, [key]: !current[key] } } };
    }),

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
