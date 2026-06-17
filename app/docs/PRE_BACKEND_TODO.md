# Pre-Backend TODO

Items surfaced by the 2026-06-16 multi-agent review (security, bugs, contracts,
quality, tests). None are exploitable today — the app is a mock with no network —
but each will force painful rework or become a real vulnerability the moment a
backend is wired in. **Address these before/while integrating the backend.**

The review's "top 3" (stale-score bug, `useHangDelete` consolidation, missing UI +
store tests) are already done. What remains is below.

---

## 1. Repository contract isn't actually swap-ready (contradicts ADR-0002)

- **No error contract.** `Promise<Spot[]>` / `Promise<Spot | undefined>` can't
  express network failure or auth rejection. Every call site assumes success
  (`spotsStore.load`, `useSpotDetail`). Decide reject-vs-`Result<T, RepoError>`
  now and wrap call sites, or every one rewrites later.
  Files: `src/data/SpotRepository.ts`, `FeedRepository.ts`, `HangRepository.ts`.
- **No pagination.** `listLocal/listMine/listFeed/listForSpot` return full arrays.
  Adding `{ cursor, limit }` + a `Page<T>` return later breaks every signature —
  the exact thing ADR-0002 promises won't happen. Add the optional shape now even
  if the mock ignores it.
- **Mock counts live in the domain layer, sync.** `vouchCount` (`src/domain/vouch.ts`)
  and `saveCountForSpot` (`src/domain/spotStats.ts`) are hash fakes called
  synchronously. When they become network reads they break every caller. Move them
  behind the repo seam now, backed by the current hash.

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

- **`saved ∩ mine` should be empty**, but the rule lives only inside `rankSpot`;
  `saveSpot` could re-add a ranked spot. Make `saveSpot` reject ids already in
  `mine`, or model one tagged list (`status: 'local' | 'saved' | 'ranked'`).
  `src/store/spotsStore.ts`.
- **Score range unenforced.** `rankSpot(spot, score: number)` and `Spot.score`
  accept any number; `scoreColor` already clamps defensively, proving the range
  isn't guaranteed. Clamp/validate at the write boundary (consider a `Score` smart
  constructor). `src/store/spotsStore.ts`, `src/domain/models.ts`.
- **Untyped id references** (`Spot.id`, `Hang.spotId`, `Member.id`,
  `characteristicIds`) are bare `string` — no referential integrity. Consider
  branded id types before the backend introduces FK mismatches. `src/domain/models.ts`.
- **Independently-optional coordinates** (`lat?`/`lng?`) allow a half-coordinate.
  Replace with `coords?: { lat; lng }`. `src/domain/models.ts`.

## 5. Reactions don't persist (becomes a silent no-op with a backend)

- Hang reactions live in `HangCard` local `useState`, so they vanish on unmount and
  the same hang shows different state on the profile vs spot screen. Heart count math
  is also ambiguous (`hang.likes + (on ? 1 : 0)` double-counts if the user is already
  in `likes`). Lift reaction state into the hangs store/model keyed by hang id, and
  persist via the repo, before reactions are expected to save. `src/ui/HangCard.tsx`.

## 6. Verify (not yet confirmed)

- **Drag-reorder score drift.** `onDragEnd` patches only the moved spot's score
  (`spots.tsx` → `rankSpot`). Over multiple reorders, neighbor scores may collide and
  the list could re-sort unexpectedly. Confirm `scoreForReorder` spacing or persist
  scores for the whole reordered array. `src/app/(tabs)/spots.tsx`.

## 7. Minor cleanups

- `HangCard.baseCount` has a dead `if (key === 'heart') return 0` branch — a foot-gun
  if ever called for heart. Remove or fold `hang.likes` in. `src/ui/HangCard.tsx`.
- Raw hex bypassing the token palette: `#f59e0b`, `#bbb`, `#d8d8d8`, `#fff` — add to
  `colors` in `src/theme/tokens.ts`.
- Repeated square icon-button style in 3 files — extract an `iconButton(size)` token.
