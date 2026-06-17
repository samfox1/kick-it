import type { Spot } from './models';

/** The full set of spots to browse — local ∪ mine, de-duped by id (first wins). */
export function exploreCatalog(local: Spot[], mine: Spot[]): Spot[] {
  const seen = new Set<string>();
  const out: Spot[] = [];
  for (const s of [...local, ...mine]) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      out.push(s);
    }
  }
  return out;
}

const byDistance = (a: Spot, b: Spot) => a.distanceMi - b.distanceMi;

const hasAll = (spot: Spot, nonNegotiables: string[]) =>
  nonNegotiables.every((id) => spot.characteristicIds.includes(id));

/**
 * Public spots near you, within a strict distance limit and matching every non-negotiable —
 * "places you can actually go to." Closest first.
 */
export function nearbySpots(catalog: Spot[], maxMi: number, nonNegotiables: string[] = []): Spot[] {
  return catalog
    .filter((s) => s.access === 'open' && s.distanceMi <= maxMi && hasAll(s, nonNegotiables))
    .sort(byDistance);
}

/**
 * Spots your crew posted (friends- or invite-only) matching every non-negotiable, closest first.
 * Not distance-capped — you travel for your friends' spots.
 */
export function crewSpots(catalog: Spot[], nonNegotiables: string[] = []): Spot[] {
  return catalog
    .filter((s) => (s.access === 'friends' || s.access === 'invite') && hasAll(s, nonNegotiables))
    .sort(byDistance);
}
