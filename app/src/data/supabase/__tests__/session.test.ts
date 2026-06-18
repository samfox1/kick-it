import { supabase } from '@/data/supabase/client';
import { ensureSession } from '../session';

jest.mock('@/data/supabase/client', () => ({
  supabase: {
    auth: { getSession: jest.fn(), signInAnonymously: jest.fn() },
    from: jest.fn(),
  },
}));

const sb = supabase as unknown as {
  auth: { getSession: jest.Mock; signInAnonymously: jest.Mock };
  from: jest.Mock;
};

const upsert = jest.fn();
const maybeSingle = jest.fn();
const defaults = { name: 'Sam Fox', initial: 'S' };

beforeEach(() => {
  jest.clearAllMocks();
  upsert.mockResolvedValue({ error: null });
  maybeSingle.mockResolvedValue({ data: { name: 'Sam Fox', initial: 'S' }, error: null });
  sb.from.mockReturnValue({ upsert, select: () => ({ eq: () => ({ maybeSingle }) }) });
  sb.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  sb.auth.signInAnonymously.mockResolvedValue({ data: { user: { id: 'uuid-1' } }, error: null });
});

describe('ensureSession', () => {
  it('signs in anonymously when there is no session, returning the member', async () => {
    const res = await ensureSession(defaults);
    expect(sb.auth.signInAnonymously).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ ok: true, value: { id: 'uuid-1', name: 'Sam Fox', initial: 'S' } });
  });

  it('reuses an existing session without signing in again', async () => {
    sb.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'uuid-2' } } },
      error: null,
    });
    const res = await ensureSession(defaults);
    expect(sb.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(res.ok && res.value.id).toBe('uuid-2');
  });

  it('does NOT sign in (and preserves identity) when getSession errors', async () => {
    sb.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'storage read failed' },
    });
    const res = await ensureSession(defaults);
    expect(sb.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(res.ok).toBe(false);
  });

  it('returns an error when anonymous sign-in fails', async () => {
    sb.auth.signInAnonymously.mockResolvedValue({ data: {}, error: { message: 'disabled' } });
    const res = await ensureSession(defaults);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('unauthorized');
  });

  it('returns an error when the profile upsert fails (not a silent fallback)', async () => {
    upsert.mockResolvedValue({ error: { message: 'rls denied' } });
    const res = await ensureSession(defaults);
    expect(res.ok).toBe(false);
  });

  it('falls back to the defaults when no profile row is returned', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await ensureSession(defaults);
    expect(res).toEqual({ ok: true, value: { id: 'uuid-1', name: 'Sam Fox', initial: 'S' } });
  });

  it('dedupes concurrent calls into a single sign-in', async () => {
    await Promise.all([ensureSession(defaults), ensureSession(defaults)]);
    expect(sb.auth.signInAnonymously).toHaveBeenCalledTimes(1);
  });
});
