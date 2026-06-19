import type { Hang, NewHang } from '../domain/models';
import type { Page, PageParams } from './page';
import type { Result } from './result';

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
}
