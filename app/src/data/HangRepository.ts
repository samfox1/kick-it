import type { Hang, NewHang, ReactionKey } from '../domain/models';
import type { Page, PageParams } from './page';
import type { Result } from './result';

/** The current user's reactions, keyed by hang id then reaction key. */
export type ReactionMap = Record<string, Partial<Record<ReactionKey, boolean>>>;

/** Narrow contract for a spot's Hang Ledger. Swap the mock for a backend later. */
export interface HangRepository {
  listForSpot(spotId: string, params?: PageParams): Promise<Result<Page<Hang>>>;
  /** The current user's own hangs (for their profile ledger). */
  listMine(params?: PageParams): Promise<Result<Page<Hang>>>;
  /** Create a new hang; the repo assigns id/timestamp/counts. Returns the stored record. */
  logHang(input: NewHang): Promise<Result<Hang>>;
  /** Delete one of the current user's hangs. */
  deleteHang(id: string): Promise<Result<void>>;
  /** Edit the title/note of one of the current user's hangs. */
  updateHang(id: string, patch: { title?: string; note?: string }): Promise<Result<void>>;
  /** The current user's reactions across all hangs. */
  listMyReactions(): Promise<Result<ReactionMap>>;
  /** Add (on) or remove (off) one of the current user's reactions to a hang. */
  setReaction(hangId: string, key: ReactionKey, on: boolean): Promise<Result<void>>;
}
