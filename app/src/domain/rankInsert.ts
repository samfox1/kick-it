/**
 * Beli-style pairwise ranking. The user compares a new spot against their existing
 * ranked list (in rank order) via "better"/"worse" answers; a binary search narrows
 * to an insertion slot. The slot (an index) is the result — scores are derived from
 * rank position separately (see scoreFromRank in ranking.ts).
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
