import type { Spot } from '../domain/models';

/**
 * Narrow data-access contract for spots. The UI/store depend only on this —
 * swapping the mock for a real backend (Supabase, etc.) means a new implementation,
 * not changes upstream. All reads are async so a network-backed impl drops in cleanly.
 */
export interface SpotRepository {
  /** Public + nearby spots to discover. */
  listLocal(): Promise<Spot[]>;
  /** Spots the current user has saved/ranked. */
  listMine(): Promise<Spot[]>;
  /** A single spot by id, or undefined if not found. */
  getById(id: string): Promise<Spot | undefined>;
}
