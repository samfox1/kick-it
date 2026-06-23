import { ok, type Result } from '@/data/result';
import { supabase } from '@/data/supabase/client';
import { failFrom } from './errors';

type ProfilePatch = { name?: string; initial?: string; handle?: string };

/** Persist profile edits to the user's `profiles` row. */
export async function saveProfile(userId: string, patch: ProfilePatch): Promise<Result<void>> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  return error ? failFrom(error) : ok(undefined);
}

/** Read the user's saved handle (null if unset). Name/initial load via ensureSession. */
export async function loadHandle(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('handle').eq('id', userId).maybeSingle();
  return (data?.handle as string | null) ?? null;
}
