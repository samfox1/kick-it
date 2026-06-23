// Manual mock for the Supabase client so tests never load the native client
// (AsyncStorage / url-polyfill / env). Tests that need specific auth behaviour
// override this with their own jest.mock factory (see session.test, auth.test).
export const supabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    signInAnonymously: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
    verifyOtp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn(() => ({})),
  rpc: jest.fn().mockResolvedValue({ error: null }),
};
