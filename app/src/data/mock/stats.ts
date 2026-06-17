/**
 * Deterministic mock community stats. A single device can't know cross-user
 * counts (endorsements, saves), so these stand in until a backend tracks them —
 * stable per key so the UI doesn't flicker. Lives in the data layer, not domain,
 * because it's fake data generation: the mock repositories attach it to results
 * the same way a real backend would return it in the payload.
 */

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Endorsement count per characteristic for a spot (3–18), keyed by characteristic id. */
export function mockVouchCounts(
  spotId: string,
  characteristicIds: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of characteristicIds) counts[id] = 3 + (hash(`${spotId}:${id}`) % 16);
  return counts;
}

/** How many people have saved a spot (1–40). */
export function mockSaveCount(spotId: string): number {
  return 1 + (hash(spotId) % 40);
}
