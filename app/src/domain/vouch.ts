/**
 * The `n` characteristics with the highest endorsement counts, highest first.
 * Pure over the spot's vouch counts (attached by the repository) — no knowledge
 * of where the counts come from.
 */
export function topEndorsed(
  vouchCounts: Record<string, number>,
  characteristicIds: string[],
  n = 4,
): string[] {
  return [...characteristicIds]
    .sort((a, b) => (vouchCounts[b] ?? 0) - (vouchCounts[a] ?? 0))
    .slice(0, n);
}
