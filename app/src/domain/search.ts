import type { Spot } from './models';

/**
 * Spots matching a free-text query against name, location, and category
 * (case-insensitive substring). An empty query returns nothing.
 */
export function searchSpots(spots: Spot[], query: string): Spot[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return spots.filter((s) => `${s.name} ${s.location} ${s.category}`.toLowerCase().includes(q));
}
