# Pre-Backend TODO

Items surfaced by the 2026-06-16 multi-agent review (security, bugs, contracts,
quality, tests). None are exploitable today — the app is a mock with no network —
but each will force painful rework or become a real vulnerability the moment a
backend is wired in. **Address these before/while integrating the backend.**

The review's "top 3" (stale-score bug, `useHangDelete` consolidation, missing UI +
store tests) are already done. What remains is below.

---

## 1. Repository contract isn't actually swap-ready (contradicts ADR-0002)

- ~~**No error contract.**~~ ✅ Done (branch `feat/repo-contracts`). Repos now return
  `Result<T>` with a typed `RepoError` (`src/data/result.ts`); `spotsStore`/`feedStore`
  handle failure and expose an `error` field; `useSpotDetail` falls back to not-found.
- ~~**No pagination.**~~ ✅ Done (same branch). List methods take `PageParams` and
  return `Page<T>` (`src/data/page.ts`), with a `paginate` mock helper. Stores read
  `.items`; a real backend can page without signature changes.
- ~~**Mock counts live in the domain layer, sync.**~~ ✅ Done (branch
  `feat/stats-behind-repo`). The deterministic generators moved to
  `src/data/mock/stats.ts`; the spot repo attaches `vouchCounts` to each `Spot`
  (as a backend would in the payload), so explore/spot-detail read data instead of
  calling sync functions in render. `topEndorsed` is now pure over the counts;
  `hangCountForSpot` (a real count over a list) stays in domain.

## 2. Authorization is client-side (security)

- Ownership ("is this my hang?") is decided on-device by `h.author.id === CURRENT_USER.id`;
  `deleteHang(id)`/`updateHang(id, patch)` take only an id. The server MUST re-verify
  ownership on every write. UI hiding a button is not a control.
  Files: `src/store/hangsStore.ts`, consumed in `profile.tsx`, `spot/[id].tsx`.
- `getById(id)` has no caller identity → IDOR risk for `friends`/`invite` spots.
  Bake identity + server-side access checks into the repo contract.
- Feed/access filtering (`visibleFeed`) happens after fetching everything. The
  backend must filter by the authenticated user's crew before sending — never ship
  private items and hide them client-side. Files: `src/store/feedStore.ts`.
- Crew mutations (`acceptRequest`/`denyRequest`, `src/store/crewStore.ts`) act on an
  id with no ownership check — server must scope to the authenticated owner's crew.

## 3. Input validation & upload hygiene (security)

- Free-text `name`, hang `title`/`note`, profile `name`/`handle`, vibe description
  flow into the store with only `.trim()` — no max length, no `handle` charset rule.
  Validate before persisting; treat all as untrusted server-side.
  Files: `src/app/add.tsx`, `edit-hang.tsx`, `edit-profile.tsx`.
- Photos: cap count + size, **strip EXIF GPS** (privacy leak), validate MIME
  server-side. `src/app/add.tsx`.
- Render only https image URIs from an allowlisted host (your CDN), not arbitrary
  user-supplied URLs. `HangCard.tsx`, `SpotRow.tsx`, `add.tsx`.
- Invite links must be minted from a high-entropy, revocable token — not derived
  from the handle. `src/lib/invite.ts`.

## 4. Model invariants to make structural

- ~~**`saved ∩ mine` should be empty.**~~ ✅ Done (branch `feat/model-invariants`).
  `saveSpot` is now a no-op when the id is already in `mine`, so the two
  collections stay disjoint regardless of call order.
- ~~**Score range unenforced.**~~ ✅ Done (same branch). `clampScore` (`domain/score.ts`)
  is applied at the write boundary in `rankSpot`; `scoreColor` reuses it.
- **Untyped id references** (`Spot.id`, `Hang.spotId`, `Member.id`,
  `characteristicIds`) are bare `string` — no referential integrity. Consider
  branded id types before the backend introduces FK mismatches. `src/domain/models.ts`.
  _Deferred: large mechanical churn across the codebase; best decided alongside the
  backend schema so the brands match real key types._
- **Independently-optional coordinates** (`lat?`/`lng?`) allow a half-coordinate.
  Replace with `coords?: { lat; lng }`. `src/domain/models.ts`.
  _Deferred: touches 12 seed entries + map/dedupe call sites, and the shape will be
  revisited when the real geo/map SDK lands (see PLAN.md §7)._

## 5. Reactions don't persist (becomes a silent no-op with a backend)

- ~~Hang reactions live in `HangCard` local `useState`, so they vanish on unmount.~~
  ✅ Done (branch `mock-dev`). Reaction state lifted into `hangsStore`
  (`reactions[hangId][key]`, `toggleReaction`), keyed by hang id, so it survives
  unmount and is shared across the profile and spot ledger; cleared on delete.
  _Still open:_ heart count math (`hang.likes + (on ? 1 : 0)`) can double-count the
  current user — resolve when the backend tracks who reacted.

## 6. Drag-reorder score drift — CONFIRMED (edge case)

Confirmed and reproduced in `src/domain/__tests__/reorderDrift.test.ts`.

- **Single drops are correct** when scores are spaced > 0.1 apart.
- **Drift inside a tie cluster:** `scoreForInsert` rounds the midpoint to 1 decimal,
  so neighbors 0.1 apart tie; `rankSpot` appends the moved spot and `sortByScoreDesc`
  is stable, so on a tie the moved spot sinks to the bottom of the equal-score group
  instead of landing at the drop position. Repeated reorders of close scores create
  those clusters.
- **Recommended fix (product decision — needs Sam):** on manual reorder, re-score the
  whole list to be monotonic with the new order (score is the sort key, so order can
  only stick if scores encode it). This slightly rescales displayed numbers, which is
  why it's a product call rather than a silent change. Files: `src/app/(tabs)/spots.tsx`,
  a new `reorderScores` in `src/domain/rankInsert.ts`.

## 7. Minor cleanups

- `HangCard.baseCount` has a dead `if (key === 'heart') return 0` branch — a foot-gun
  if ever called for heart. Remove or fold `hang.likes` in. `src/ui/HangCard.tsx`.
- Raw hex bypassing the token palette: `#f59e0b`, `#bbb`, `#d8d8d8`, `#fff` — add to
  `colors` in `src/theme/tokens.ts`.
- Repeated square icon-button style in 3 files — extract an `iconButton(size)` token.
