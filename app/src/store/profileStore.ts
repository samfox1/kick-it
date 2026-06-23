import { create } from 'zustand';

import { CURRENT_MEMBER, CURRENT_USER } from '@/data/mock/profile';
import { usingSupabase } from '@/data/repositories';
import { ok, type Result } from '@/data/result';
import { reportFailure } from '@/store/optimistic';
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
  updateProfile: (patch: { name?: string; handle?: string; avatar?: string }) => void;
  /** Replace the identity wholesale (e.g. hydrate from the authenticated session). */
  hydrate: (member: Member) => void;
  /** Set the signed-in email (null = guest). */
  setEmail: (email: string | null) => void;
  /** Set the handle (e.g. hydrate the saved handle on launch). */
  setHandle: (handle: string) => void;
  /** First-time username pick. Awaited + returns a Result so the UI can show "taken". */
  claimUsername: (username: string) => Promise<Result<void>>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  member: CURRENT_MEMBER,
  handle: CURRENT_USER.handle,
  email: null,
  updateProfile: ({ name, handle, avatar }) => {
    set((s) => {
      const trimmedName = name?.trim();
      const trimmedHandle = handle?.trim();
      const member = { ...s.member };
      if (trimmedName) {
        member.name = trimmedName;
        member.initial = trimmedName[0].toUpperCase();
      }
      if (avatar) member.avatar = avatar;
      return { member, handle: trimmedHandle || s.handle };
    });
    // Persist the edit to the backend (Supabase mode). Lazy-required so the mock/tests never
    // load the native client.
    if (usingSupabase) {
      const { member, handle: h } = get();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveProfile } = require('@/data/supabase/profileSync');
      void saveProfile(member.id, {
        name: member.name,
        initial: member.initial,
        handle: h,
        avatar: typeof member.avatar === 'string' ? member.avatar : undefined,
      }).then((res: import('@/data/result').Result<unknown>) => reportFailure('saveProfile', res));
    }
  },
  hydrate: (member) => set({ member }),
  setEmail: (email) => set({ email }),
  setHandle: (handle) => set({ handle }),
  claimUsername: async (username) => {
    const name = username;
    const handle = `@${username}`;
    const applyLocal = () =>
      set((s) => ({ member: { ...s.member, name, initial: name[0].toUpperCase() }, handle }));

    if (!usingSupabase) {
      applyLocal(); // mock has no real uniqueness
      return ok(undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { claimUsername } = require('@/data/supabase/profileSync');
    const res: Result<void> = await claimUsername(get().member.id, name, handle);
    if (res.ok) applyLocal(); // only adopt it locally once the backend accepts it
    return res;
  },
}));

/** Whether `id` is the current user — the single place that answers "is this me?". */
export const isMe = (id: string): boolean => useProfileStore.getState().member.id === id;
