import type { Hang, NewHang } from '../domain/models';
import type { Page, PageParams } from './page';
import type { Result } from './result';

/** Narrow contract for a spot's Hang Ledger. Swap the mock for a backend later. */
export interface HangRepository {
  listForSpot(spotId: string, params?: PageParams): Promise<Result<Page<Hang>>>;
  /** Create a new hang; the repo assigns id/timestamp/counts. Returns the stored record. */
  logHang(input: NewHang): Promise<Result<Hang>>;
}
