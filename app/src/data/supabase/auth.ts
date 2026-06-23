import { fail, ok, type Result } from '@/data/result';
import { supabase } from '@/data/supabase/client';
import type { Member } from '@/domain/models';
import { failFrom } from './errors';
import { loadHandle } from './profileSync';
import { ensureProfile } from './session';

/** Email the user a 6-digit sign-in code (creates the account if new). */
export async function sendEmailOtp(email: string): Promise<Result<void>> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error ? failFrom(error) : ok(undefined);
}

/**
 * Verify the emailed code. On success the session becomes that email's account; we ensure a
 * profile row (with a neutral placeholder name — never the email) and report `needsUsername`
 * when the account hasn't chosen a username/handle yet, so the app can prompt for one.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<Result<{ member: Member; email: string; needsUsername: boolean }>> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return failFrom(error);
  if (!data.user) return fail('unknown', 'Verification failed');

  const uid = data.user.id;
  // Neutral placeholder — the user picks a username next; we never seed it from the email.
  const res = await ensureProfile(uid, { name: 'New member', initial: '?' });
  if (!res.ok) return res;

  const handle = await loadHandle(uid);
  return ok({ member: res.value, email, needsUsername: !handle });
}

/** Sign out of the current account. */
export async function signOut(): Promise<Result<void>> {
  const { error } = await supabase.auth.signOut();
  return error ? failFrom(error) : ok(undefined);
}
