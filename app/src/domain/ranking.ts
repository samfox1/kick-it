import type { Spot } from './models';

/** Returns a new array of spots ordered highest score first. Stable; does not mutate input. */
export function sortByScoreDesc(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => b.score - a.score);
}

// Personal-score band for a ranked list: #1 sits at the top, the last spot at the
// bottom, everything else evenly between. Order is the source of truth; the score
// is a readout of rank, so reordering can't disagree with the displayed number.
const TOP_SCORE = 9.6;
const BOTTOM_SCORE = 6.5;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Personal 0–10 score for a spot at rank `index` (0 = best) in a list of `total`. */
export function scoreFromRank(index: number, total: number): number {
  if (total <= 1) return TOP_SCORE;
  return round1(TOP_SCORE - (index / (total - 1)) * (TOP_SCORE - BOTTOM_SCORE));
}

/** Re-derive every spot's personal score from its position in the ranked list. */
export function applyRankScores(orderedSpots: Spot[]): Spot[] {
  return orderedSpots.map((spot, i) => ({ ...spot, score: scoreFromRank(i, orderedSpots.length) }));
}
