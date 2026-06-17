import { create } from 'zustand';

import { HANGS } from '@/data/mock/hangSeed';
import type { Hang, ReactionKey } from '@/domain/models';

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
}

export const useHangsStore = create<HangsState>((set) => ({
  hangs: HANGS,
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
}));
