import type { SupabaseClient } from '@supabase/supabase-js';

import { fail, ok, type Result } from '@/data/result';
import { supabase } from '@/data/supabase/client';
import { defaultAvatarUrl } from '@/domain/avatar';
import type { Member } from '@/domain/models';

/** The current authenticated user's id, or null. The one place repos resolve identity,
 *  so they never reach into supabase.auth directly. */
export async function currentUserId(db: SupabaseClient): Promise<string | null> {
  const { data } = await db.auth.getUser();
  return data.user?.id ?? null;
}

export type ProfileDefaults = { name: string; initial: string };

/**
 * Ensure a `profiles` row exists for the user and return their Member. Creates it only
 * if missing (ignoreDuplicates), so an edited name isn't overwritten. Shared by the
 * anonymous launch bootstrap and the email sign-in flow.
 */
export async function ensureProfile(
  userId: string,
  defaults: ProfileDefaults,
): Promise<Result<Member>> {
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        name: defaults.name,
        initial: defaults.initial,
        avatar: defaultAvatarUrl(userId),
      },
      { onConflict: 'id', ignoreDuplicates: true },
    );
  if (upsertError) return fail('network', upsertError.message);

  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('name, initial, avatar')
    .eq('id', userId)
    .maybeSingle();
  if (readError) return fail('network', readError.message);

  return ok({
    id: userId,
    name: profile?.name ?? defaults.name,
    initial: profile?.initial ?? defaults.initial,
    avatar: profile?.avatar ?? defaultAvatarUrl(userId),
  });
}

let inflight: Promise<Result<Member>> | null = null;

/**
 * Ensure there's a session (anonymous if needed) and a matching `profiles` row,
 * then return the current user's Member. Concurrent callers (e.g. a StrictMode
 * double-mounted launch effect) share one in-flight call, so we never mint two
 * anonymous users. Returns a Result so failures aren't silently swallowed.
 */
export function ensureSession(defaults: ProfileDefaults): Promise<Result<Member>> {
  inflight ??= run(defaults).finally(() => {
    inflight = null;
  });
  return inflight;
}

async function run(defaults: ProfileDefaults): Promise<Result<Member>> {
  const existing = await supabase.auth.getSession();
  // A read error must NOT fall through to anonymous sign-in — that would abandon
  // a real session and replace the user's identity. Bail and let the caller retry.
  if (existing.error) return fail('unknown', existing.error.message);

  let userId = existing.data.session?.user.id;
  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      return fail('unauthorized', error?.message ?? 'Anonymous sign-in failed');
    }
    userId = data.user.id;
  }

  return ensureProfile(userId, defaults);
}
