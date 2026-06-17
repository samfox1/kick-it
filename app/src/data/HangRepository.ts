import type { Hang } from '../domain/models';

/** Narrow contract for a spot's Hang Ledger. Swap the mock for a backend later. */
export interface HangRepository {
  listForSpot(spotId: string): Promise<Hang[]>;
}
