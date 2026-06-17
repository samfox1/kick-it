import { create } from 'zustand';

import { HANGS } from '@/data/mock/hangSeed';
import type { Hang } from '@/domain/models';

/** Mutable store of all logged hangs. Swap the seed for a backend later — screens unchanged. */
interface HangsState {
  hangs: Hang[];
  deleteHang: (id: string) => void;
  updateHang: (id: string, patch: { title?: string; note?: string }) => void;
}

export const useHangsStore = create<HangsState>((set) => ({
  hangs: HANGS,

  deleteHang: (id) => set((s) => ({ hangs: s.hangs.filter((h) => h.id !== id) })),

  updateHang: (id, patch) =>
    set((s) => ({ hangs: s.hangs.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
}));
