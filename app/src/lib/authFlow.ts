import { CURRENT_MEMBER } from '@/data/mock/profile';
import { signOut as apiSignOut } from '@/data/supabase/auth';
import { ensureSession } from '@/data/supabase/session';
import type { Member } from '@/domain/models';
import { useFeedStore } from '@/store/feedStore';
import { useHangsStore } from '@/store/hangsStore';
import { useProfileStore } from '@/store/profileStore';
import { useSpotsStore } from '@/store/spotsStore';

/** Reload all per-user collections after the identity changes (sign in/out). */
async function refreshForIdentity(): Promise<void> {
  useHangsStore.setState({ hangs: [], reactions: {} });
  await Promise.all([useSpotsStore.getState().load(), useFeedStore.getState().load()]);
  await Promise.all([
    useHangsStore.getState().loadMine(),
    useHangsStore.getState().loadMyReactions(),
  ]);
}

/** Adopt a freshly signed-in account: set identity + email, then load its data. */
export async function completeSignIn(member: Member, email: string): Promise<void> {
  useProfileStore.getState().hydrate(member);
  useProfileStore.getState().setEmail(email);
  await refreshForIdentity();
}

/** Sign out and fall back to a fresh anonymous guest session. */
export async function signOutToGuest(): Promise<void> {
  await apiSignOut();
  const res = await ensureSession({
    name: CURRENT_MEMBER.name,
    initial: CURRENT_MEMBER.initial,
  });
  if (res.ok) useProfileStore.getState().hydrate(res.value);
  useProfileStore.getState().setEmail(null);
  await refreshForIdentity();
}
