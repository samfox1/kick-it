import { create } from 'zustand';

import { CURRENT_MEMBER, CURRENT_USER } from '@/data/mock/profile';
import type { Member } from '@/domain/models';

/**
 * The current user's editable profile. Seeded from the mock user; a backend would
 * hydrate and persist this. Lives in a store so edits show everywhere (profile
 * header, and as the author of new hangs/rankings).
 */
interface ProfileState {
  member: Member;
  handle: string;
  /** The signed-in account's email, or null when browsing as an anonymous guest. */
  email: string | null;
  updateProfile: (patch: { name?: string; handle?: string }) => void;
  /** Replace the identity wholesale (e.g. hydrate from the authenticated session). */
  hydrate: (member: Member) => void;
  /** Set the signed-in email (null = guest). */
  setEmail: (email: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  member: CURRENT_MEMBER,
  handle: CURRENT_USER.handle,
  email: null,
  updateProfile: ({ name, handle }) =>
    set((s) => {
      const trimmedName = name?.trim();
      const trimmedHandle = handle?.trim();
      return {
        member: trimmedName
          ? { ...s.member, name: trimmedName, initial: trimmedName[0].toUpperCase() }
          : s.member,
        handle: trimmedHandle || s.handle,
      };
    }),
  hydrate: (member) => set({ member }),
  setEmail: (email) => set({ email }),
}));

/** Whether `id` is the current user — the single place that answers "is this me?". */
export const isMe = (id: string): boolean => useProfileStore.getState().member.id === id;
