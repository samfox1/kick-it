import { useCallback } from 'react';

import { usingSupabase } from '@/data/repositories';
import { useAuthGateStore } from '@/store/authGateStore';
import { useProfileStore } from '@/store/profileStore';

/**
 * Guard for write actions: browsing is open, but contributing needs a real account.
 * Returns a function to call before a write — if the user is a signed-out guest (Supabase
 * mode, no email), it shows the branded sign-in prompt (via <AccountGateModal/>) and returns
 * false; otherwise returns true. In mock mode there's no real auth, so it always allows.
 */
export function useRequireAccount() {
  // Read identity fresh via getState() (not a subscription) so the returned guard is a stable
  // callback — safe to capture in a long-lived ref (e.g. a PanResponder) without going stale.
  return useCallback(
    (reason = 'Sign in or create an account to contribute to Kick It.'): boolean => {
      if (!usingSupabase || useProfileStore.getState().email) return true;
      useAuthGateStore.getState().show(reason);
      return false;
    },
    [],
  );
}
