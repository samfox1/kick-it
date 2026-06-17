import type { Spot } from './models';

/** Returns a new array of spots ordered highest score first. Stable; does not mutate input. */
export function sortByScoreDesc(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => b.score - a.score);
}
