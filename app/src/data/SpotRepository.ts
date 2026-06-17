import type { Spot } from '../domain/models';
import type { Page, PageParams } from './page';
import type { Result } from './result';

/**
 * Narrow data-access contract for spots. The UI/store depend only on this —
 * swapping the mock for a real backend (Supabase, etc.) means a new implementation,
 * not changes upstream. Reads are async, paginated, and return a Result so a
 * network-backed impl drops in without touching call sites.
 */
export interface SpotRepository {
  /** Public + nearby spots to discover. */
  listLocal(params?: PageParams): Promise<Result<Page<Spot>>>;
  /** Spots the current user has saved/ranked. */
  listMine(params?: PageParams): Promise<Result<Page<Spot>>>;
  /** A single spot by id; `value` is undefined when the spot genuinely doesn't exist. */
  getById(id: string): Promise<Result<Spot | undefined>>;
}
