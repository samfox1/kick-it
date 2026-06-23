# 3. Ranking order is the source of truth; score is derived from rank

Date: 2026-06-17

## Status
Accepted

## Context
"My spots" is a personal ranked list (Beli-style: you place a spot via pairwise
"which was better?" comparisons, not by typing a number). Originally the store kept a
`score` per spot and the displayed order was `sortByScoreDesc(mine)` — i.e. **score was
the source of truth and order was derived**.

That inversion made drag-to-reorder fragile: moving an item only adjusted its own score
(midpoint of neighbors, rounded to 1 decimal), which could tie with a neighbor; the
stable sort then sank the moved item to the bottom of the tie group instead of the drop
position (confirmed in the old `reorderDrift.test.ts`). It also let order and score
disagree.

## Decision
Invert it: **the array order of `mine` IS the ranking** (index 0 = best), and each
spot's `score` is a *readout* derived from its position via `scoreFromRank(index, total)`
(`src/domain/ranking.ts`), which spreads a fixed band (9.6 → 6.5) across the list.

- `rankSpot(spot, index)` inserts at a rank position; `reorderMine(ordered)` accepts a
  new order. Both call `applyRankScores` to re-derive every score.
- Pairwise ranking (`insertIndex`) and drag-to-reorder now both produce an **index**,
  unifying the two mechanics under one source of truth.
- `visibleMySpots` is a passthrough (no longer sorts by score).
- On load, seed `mine` is sorted by its seed score once to establish order, then
  re-scored, so the model is consistent from first render.

## Consequences
- Drag-to-reorder is exact and drift-free by construction; ties in the 1-decimal readout
  are cosmetic only (order is the array, not the score).
- Reordering a spot changes its score **and** the scores of the spots it passed (their
  ranks shifted) — intended, matches Beli ("bump one up, the ones it passed move down").
- Displayed numbers no longer come from the seed's hand-tuned values; they follow the
  band. The band (`TOP_SCORE`/`BOTTOM_SCORE`) is the tuning knob.
- The old midpoint helpers (`scoreForInsert`, `scoreForReorder`) are removed.
