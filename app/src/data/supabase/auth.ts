import { fail, ok, type Result } from '@/data/result';
import { supabase } from '@/data/supabase/client';
import type { Member } from '@/domain/models';
import { failFrom } from './errors';
import { ensureProfile } from './session';

/** Email the user a 6-digit sign-in code (creates the account if new). */
export async function sendEmailOtp(email: string): Promise<Result<void>> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error ? failFrom(error) : ok(undefined);
}

/**
 * Verify the emailed code. On success the session becomes that email's account; we ensure
 * a profile row (named from the email local-part for new accounts) and return the member + email.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<Result<{ member: Member; email: string }>> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return failFrom(error);
  if (!data.user) return fail('unknown', 'Verification failed');

  const local = email.split('@')[0] || 'You';
  const res = await ensureProfile(data.user.id, {
    name: local,
    initial: (local[0] ?? '?').toUpperCase(),
  });
  if (!res.ok) return res;
  return ok({ member: res.value, email });
}

/** Sign out of the current account. */
export async function signOut(): Promise<Result<void>> {
  const { error } = await supabase.auth.signOut();
  return error ? failFrom(error) : ok(undefined);
}
