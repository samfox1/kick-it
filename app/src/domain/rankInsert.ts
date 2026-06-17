/**
 * Beli-style pairwise ranking. The user compares a new spot against their existing
 * ranked list (sorted high→low) via "better"/"worse" answers; a binary search narrows
 * to an insertion slot, and the score is interpolated from the neighbors.
 */

type Answer = 'better' | 'worse';

function bounds(length: number, answers: Answer[]): { lo: number; hi: number } {
  let lo = 0;
  let hi = length;
  for (const a of answers) {
    const mid = (lo + hi) >> 1;
    if (a === 'better') hi = mid;
    else lo = mid + 1;
  }
  return { lo, hi };
}

/** Index in the ranked list to compare against next, or -1 when the slot is resolved. */
export function nextComparisonIndex(length: number, answers: Answer[]): number {
  const { lo, hi } = bounds(length, answers);
  return lo < hi ? (lo + hi) >> 1 : -1;
}

/** The final 0..length insertion slot implied by the answers. */
export function insertIndex(length: number, answers: Answer[]): number {
  return bounds(length, answers).lo;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Score for a new spot inserted at `index` into a high→low list of scores. */
export function scoreForInsert(scoresDesc: number[], index: number): number {
  if (scoresDesc.length === 0) return 8;
  if (index <= 0) return round1(Math.min(10, scoresDesc[0] + 0.2));
  if (index >= scoresDesc.length) {
    return round1(Math.max(0, scoresDesc[scoresDesc.length - 1] - 0.2));
  }
  return round1((scoresDesc[index - 1] + scoresDesc[index]) / 2);
}

/**
 * After a manual drag-to-reorder, the score for the moved spot — the midpoint of its new
 * neighbors (or just past the ends). `newOrderScores` is the full list's scores in the new
 * order; `toIndex` is where the spot was dropped. Only the moved spot is re-scored.
 */
export function scoreForReorder(newOrderScores: number[], toIndex: number): number {
  const others = newOrderScores.filter((_, i) => i !== toIndex);
  return scoreForInsert(others, toIndex);
}
