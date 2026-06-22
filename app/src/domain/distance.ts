import { milesBetween, type Coord } from './geo';
import type { Spot } from './models';

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Return spots with `distanceMi` computed from `origin`. Spots without coordinates are left
 * unchanged. Used in Supabase mode, where rows arrive with distanceMi=0 (distance is a
 * per-viewer value, not stored). Mock mode keeps its curated seed distances.
 */
export function withDistances(spots: Spot[], origin: Coord): Spot[] {
  return spots.map((s) =>
    s.lat != null && s.lng != null
      ? { ...s, distanceMi: round1(milesBetween(origin, { lat: s.lat, lng: s.lng })) }
      : s,
  );
}
