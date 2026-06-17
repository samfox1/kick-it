import type { Hang } from './models';

/** How many hangs have been logged at a spot — a real count from the ledger. */
export function hangCountForSpot(hangs: Hang[], spotId: string): number {
  return hangs.filter((h) => h.spotId === spotId).length;
}

/**
 * How many people have saved a spot. Deterministic mock (stable per spot, 1–40) until a
 * backend tracks real saves across users — a single device can't know the community count.
 */
export function saveCountForSpot(spotId: string): number {
  let h = 0;
  for (let i = 0; i < spotId.length; i++) h = (h * 31 + spotId.charCodeAt(i)) >>> 0;
  return 1 + (h % 40);
}
