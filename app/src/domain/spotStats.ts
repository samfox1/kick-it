import type { Hang } from './models';

/** How many hangs have been logged at a spot — a real count from the ledger. */
export function hangCountForSpot(hangs: Hang[], spotId: string): number {
  return hangs.filter((h) => h.spotId === spotId).length;
}
