# Backend Integration TODO

Tracks decisions/work surfaced by the code review of the Supabase foundation
(2026-06-18). The `ensureSession` bugs from that review are already fixed; the
items below are deliberately deferred to when the Supabase-backed repositories
are written (or to pre-launch hardening). Resolve them alongside the relevant repo.

## Seams to add WITH the first repository
- **`mapPostgrestError(error) → RepoError`** — one shared translator (RLS denial /
  `42501` / `PGRST116` not-found / network) next to `client.ts`, so the three repos
  don't each invent their own mapping and drift.
- **Opaque cursor codec for `Page`** — the mock uses numeric offsets; Supabase should
  use **keyset** pagination (`created_at`/`id`), because offsets break when feed/hangs
  prepend. Define the encode/decode once.
- **`currentUserId(): Promise<string|null>`** alongside `ensureSession`, so repos don't
  reach into `supabase.auth` directly (keep client=transport / session=identity / repos=data).

## SpotRepository
- **`listLocal` distance** — `Spot.distanceMi` needs haversine from the viewer's
  lat/lng; PostgREST can't. Use an RPC (`list_local_spots(viewer_lat, viewer_lng)`) or
  compute client-side from stored `lat/lng`. Decide what `score` an unranked local spot gets.
- **`listMine` score** — handled for the single-page case: the repo returns rankings ordered
  by position and applies `applyRankScores`. Revisit if/when `listMine` paginates (a page
  doesn't carry the whole-list `total` that `scoreFromRank` needs).
- **`characteristic_ids text[]` vs `endorsements` FK** — two sources of truth for a spot's
  traits. Prefer a `spot_characteristics(spot_id, characteristic_id)` join table; map back
  to `string[]` in the repo.

## Spot writes — status
- DONE: `createSpot`, `saveSpot`/`unsaveSpot`/`listSaved` persist (verified live).
- DONE: `rankSpot`/`reorderMine` persist via the `set_rankings` RPC (0002); ranking a saved
  spot also clears its `saved_spots` row. So all spot writes are now persisted.

## Rankings (reorder) — DONE
- Solved with `set_rankings(p_spot_ids uuid[])` (migration 0002): delete-then-insert in one
  transaction rewrites the whole order, sidestepping the `unique(user_id, position)` shuffle.
  Verified live (set order → reorder → clear). The deferred constraint stays as a safety net.

## FeedRepository (the hardest)
- **`activity` is under-denormalized** — it stores only ids + `rank`. Building
  `HangItem`/`RankedItem` needs `spotName`, author `by`, `access`, hang
  `image/note/attendees/extraAttendees/likes`, ranked `category/score/thumb`. And a global
  feed of others' rankings has **no per-viewer `score`**. → **snapshot** the display fields
  onto the `activity` row at write time (feed entries are immutable history anyway).
- **`new_spot` union arm** — `FeedItem` still includes `NewSpotItem` (used by `FeedCard`,
  `notifications`, factories) but the feed seed dropped it and `activity_kind` lacks it.
  Reconcile: narrow the union (drop `new_spot`) OR add `'new_spot'` to `activity_kind`.
- Add a `check` so `activity` rows are valid per kind
  (`kind='hang'` ⇒ `hang_id` not null; `kind='ranked'` ⇒ `rank` not null).

## Contract clean-ups
- **`extraAttendees`** is declared "server-owned" (omitted from `NewHang`, forced to 0) but
  is clearly user-supplied ("9 of us, 6 unnamed"). Decide: let the client set it (drop from
  the Omit) — the column already exists.
- **`handle`** — `profiles.handle` (unique) exists but the bootstrap no longer writes it.
  Persist it when real profile editing/auth lands.

## Security hardening (before real users)
- **`profiles_read` is `using (true)`** — combined with frictionless anonymous sign-in, any
  drive-by session can read every profile (name + handle). Needed broadly today for author
  names on open content, but before launch: scope reads (self + crew + content authors) and
  add **abuse controls on anonymous sign-in** (rate limit / Turnstile).
- **`activity_insert`** doesn't verify the actor owns the referenced hang/ranking — a user can
  fabricate feed events. Tighten the `with check` or write activity via trigger/RPC.
- **per-user writes on non-visible spots** — `endorsements`/`saved`/`rankings` don't re-check
  `can_view(spot)`. Low risk (UUIDs aren't enumerable) but add the check if vouch integrity matters.
