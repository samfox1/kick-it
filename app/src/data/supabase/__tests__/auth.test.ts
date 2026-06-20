import { supabase } from '@/data/supabase/client';
import { sendEmailOtp, signOut, verifyEmailOtp } from '../auth';

jest.mock('@/data/supabase/client', () => ({
  supabase: {
    auth: { signInWithOtp: jest.fn(), verifyOtp: jest.fn(), signOut: jest.fn() },
    from: jest.fn(),
  },
}));

const sb = supabase as unknown as {
  auth: { signInWithOtp: jest.Mock; verifyOtp: jest.Mock; signOut: jest.Mock };
  from: jest.Mock;
};

const upsert = jest.fn();
const maybeSingle = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  upsert.mockResolvedValue({ error: null });
  maybeSingle.mockResolvedValue({ data: { name: 'sam', initial: 'S' }, error: null });
  sb.from.mockReturnValue({ upsert, select: () => ({ eq: () => ({ maybeSingle }) }) });
});

describe('sendEmailOtp', () => {
  it('requests an OTP for the email', async () => {
    sb.auth.signInWithOtp.mockResolvedValue({ error: null });
    const res = await sendEmailOtp('sam@x.com');
    expect(res.ok).toBe(true);
    expect(sb.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'sam@x.com' });
  });

  it('returns a failure when the request errors', async () => {
    sb.auth.signInWithOtp.mockResolvedValue({ error: { message: 'rate limited' } });
    expect((await sendEmailOtp('sam@x.com')).ok).toBe(false);
  });
});

describe('verifyEmailOtp', () => {
  it('verifies the code, ensures a profile, and returns the member + email', async () => {
    sb.auth.verifyOtp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const res = await verifyEmailOtp('sam@x.com', '123456');
    expect(sb.auth.verifyOtp).toHaveBeenCalledWith({
      email: 'sam@x.com',
      token: '123456',
      type: 'email',
    });
    expect(res).toEqual({
      ok: true,
      value: { member: { id: 'u1', name: 'sam', initial: 'S' }, email: 'sam@x.com' },
    });
  });

  it('fails on an invalid code', async () => {
    sb.auth.verifyOtp.mockResolvedValue({ data: {}, error: { message: 'invalid otp' } });
    expect((await verifyEmailOtp('sam@x.com', '000000')).ok).toBe(false);
  });
});

describe('signOut', () => {
  it('signs out', async () => {
    sb.auth.signOut.mockResolvedValue({ error: null });
    expect((await signOut()).ok).toBe(true);
    expect(sb.auth.signOut).toHaveBeenCalled();
  });
});
