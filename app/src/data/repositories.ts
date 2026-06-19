import { createDefaultHangRepository } from '@/data/mock/hangSeed';
import { createDefaultSpotRepository } from '@/data/mock/seed';
import type { HangRepository } from '@/data/HangRepository';
import type { SpotRepository } from '@/data/SpotRepository';

/**
 * Picks the data source. Mock by default; set EXPO_PUBLIC_USE_SUPABASE=true in
 * .env.local to use the live Supabase backend. Keeping this behind a flag lets the
 * backend be swapped in incrementally and reversibly.
 */
export const usingSupabase = process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';

export function createSpotRepository(): SpotRepository {
  if (usingSupabase) {
    // Lazy-loaded so the RN-only Supabase client is never imported under the mock
    // (or in tests, which would crash on the native polyfills).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseSpotRepository } = require('@/data/supabase/SupabaseSpotRepository');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('@/data/supabase/client');
    return new SupabaseSpotRepository(supabase);
  }
  return createDefaultSpotRepository();
}

export function createHangRepository(): HangRepository {
  if (usingSupabase) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseHangRepository } = require('@/data/supabase/SupabaseHangRepository');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('@/data/supabase/client');
    return new SupabaseHangRepository(supabase);
  }
  return createDefaultHangRepository();
}
