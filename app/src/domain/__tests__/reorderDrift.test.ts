import type { Spot } from '../models';
import { sortByScoreDesc } from '../ranking';
import { scoreForReorder } from '../rankInsert';
import { makeSpot } from '../../test-utils/factories';

/**
 * Faithfully simulates the drag-to-reorder path in spots.tsx:
 *   display = sortByScoreDesc(mine); drag display[from] to `to`; the moved spot is
 *   re-scored via scoreForReorder; rankSpot appends it to `mine`; the list re-sorts.
 * Returns the resulting display order (ids).
 */
function reorder(mine: Spot[], fromDisplayIdx: number, toIdx: number): string[] {
  const data = sortByScoreDesc(mine);
  const [moved] = data.splice(fromDisplayIdx, 1);
  data.splice(toIdx, 0, moved);
  const score = scoreForReorder(
    data.map((s) => s.score),
    toIdx,
  );
  const newMine = [...mine.filter((m) => m.id !== moved.id), { ...moved, score }];
  return sortByScoreDesc(newMine).map((s) => s.id);
}

describe('drag-reorder scoring', () => {
  it('places a dropped spot correctly when scores are well spaced', () => {
    const mine = [
      makeSpot({ id: 'A', score: 9 }),
      makeSpot({ id: 'B', score: 7 }),
      makeSpot({ id: 'C', score: 5 }),
    ];
    // Drag C (bottom) to the top.
    expect(reorder(mine, 2, 0)).toEqual(['C', 'A', 'B']);
  });

  // KNOWN LIMITATION (PRE_BACKEND_TODO §6): midpoint scoring + 1-decimal rounding
  // can tie two spots; the moved spot then sinks to the bottom of the tie group
  // instead of landing where it was dropped. Documents current behavior.
  it('drifts when reordering within a tie cluster', () => {
    const mine = [
      makeSpot({ id: 'A', score: 8.0 }),
      makeSpot({ id: 'X', score: 8.0 }), // already tied with A
      makeSpot({ id: 'B', score: 7.9 }),
    ];
    // Drag B up between A and X — the user intends ['A', 'B', 'X'].
    // B re-scores to 8.0 (midpoint of the 8.0/8.0 neighbors) and sorts last among
    // the ties, so it drifts back to the bottom.
    expect(reorder(mine, 2, 1)).toEqual(['A', 'X', 'B']);
  });
});
