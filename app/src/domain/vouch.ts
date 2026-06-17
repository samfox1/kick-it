/**
 * Mock endorsement count for a spot's characteristic. Deterministic and stable
 * (so the UI doesn't flicker), in the 3–18 range. Replaced by real counts when
 * the backend lands.
 */
export function vouchCount(spotId: string, characteristicId: string): number {
  const key = `${spotId}:${characteristicId}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return 3 + (h % 16);
}

/** The `n` most-endorsed characteristics for a spot, highest vouch count first. */
export function topEndorsed(spotId: string, characteristicIds: string[], n = 4): string[] {
  return [...characteristicIds]
    .sort((a, b) => vouchCount(spotId, b) - vouchCount(spotId, a))
    .slice(0, n);
}
