import { fail, ok, type Result } from '@/data/result';
import { supabase } from '@/data/supabase/client';
import { failFrom } from './errors';

type ProfilePatch = { name?: string; initial?: string; handle?: string; avatar?: string };

/** Persist profile edits to the user's `profiles` row. */
export async function saveProfile(userId: string, patch: ProfilePatch): Promise<Result<void>> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  return error ? failFrom(error) : ok(undefined);
}

/** Claim a username (sets name + handle). The handle is unique, so a duplicate returns a
 *  `conflict` so the caller can ask for a different one. */
export async function claimUsername(
  userId: string,
  name: string,
  handle: string,
): Promise<Result<void>> {
  const { error } = await supabase
    .from('profiles')
    .update({ name, initial: name[0].toUpperCase(), handle })
    .eq('id', userId);
  if (!error) return ok(undefined);
  if (error.code === '23505') return fail('conflict', 'That username is taken — try another.');
  return failFrom(error);
}

/** Read the user's saved handle (null if unset). Name/initial load via ensureSession. */
export async function loadHandle(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('handle').eq('id', userId).maybeSingle();
  return (data?.handle as string | null) ?? null;
}
