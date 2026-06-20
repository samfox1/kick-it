# Backend Integration TODO

Tracks decisions/work surfaced by the code review of the Supabase foundation
(2026-06-18). The `ensureSession` bugs from that review are already fixed; the
items below are deliberately deferred to when the Supabase-backed repositories
are written (or to pre-launch hardening). Resolve them alongside the relevant repo.

## Post-cutover review (2026-06-19) — fixed + remaining
Fixed: extracted `currentUserId(db)` (killed 8× auth-guard dup + the auth leak); optimistic
store writes now `reportFailure` instead of dropping Results silently; `loadForSpot`/`loadMine`
use `replaceScope` (authoritative per scope, so server deletes propagate); `parseFeedItem`
validates the `activity.payload` boundary; render gated on session-ready (no stale-'sam' writes);
`listLocal` null-guard; mapper/feed edge tests added.
Remaining: (1) optimistic writes only *log* failures — add rollback/retry for delete/update/rank
(merge can't reconcile a failed edit). (2) Pagination divergence — Supabase lists return a single
page (ignore `params`/`nextCursor`) while the mock paginates; make explicit or implement keyset.
(3) A cross-implementation contract-parity test suite (same assertions vs mock + Supabase) would
catch mock/prod drift. (4) `AttendeeSnapshot` type for the jsonb (vs reusing `Member`).

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

## Hangs — status
- DONE: `logHang`/`listForSpot`/`listMine`/`deleteHang`/`updateHang` persist (verified live).
  Attendees are a denormalized jsonb snapshot (0003); identity is hydrated so your hangs stay
  yours. Hang store loads per-spot (spot screen) and mine (profile) and merges by id.
- DONE: **your reactions persist** — `toggleReaction` write-throughs to the `reactions` table
  and `loadMyReactions` hydrates them (verified live). Cascades on hang delete.
- TODO (multi-user): `Hang.likes` base is still 0 in the mapper — fine for one user (count =
  your own heart), but aggregate other users' heart counts once there are other users.
- Feed visibility uses the hydrated identity (`crewFriendIds(selfId, ...)`), so your own
  friends-only items show.

## Auth — email OTP (done 2026-06-20)
- `sendEmailOtp`/`verifyEmailOtp`/`signOut` (`data/supabase/auth.ts`); 6-digit code via
  `signInWithOtp` + `verifyOtp(type:'email')`. Auth screen at `app/auth.tsx`; entry + real
  sign-out in Settings (gated on `usingSupabase`). `authFlow` reloads per-user data on sign
  in/out; `profileStore.email` tracks guest vs signed-in.
- **Dashboard setup required:** enable the Email provider; set the Magic Link email template to
  include `{{ .Token }}` so it sends a code (not just a link). For dev, turning OFF "Confirm
  email" makes verify immediate.
- **Write-gating (done):** browsing is open; every write (rank, log hang, save, react, add spot,
  endorse) is gated behind a real account via `useRequireAccount` — guests get an Alert → /auth.
  Mock mode and signed-in users pass through. This removes the guest-carryover problem (guests
  can't write) and the anon-write spam vector.
- **Server-side enforcement (done, 0005):** `is_real_user()` (checks the JWT `is_anonymous`
  claim) added to the WITH CHECK of every content-write policy (spots/hangs/rankings/saved/
  endorsements/reactions/activity). Guests can read + bootstrap a profile + set browse prefs,
  but content writes are blocked at the DB (verified: anon insert → 42501). Profiles/preferences
  intentionally stay writable for the anonymous bootstrap + filters.
- TODO: Apple/phone providers (need dev build / SMS provider).

## Crew — deferred by design
- Crew is inherently multi-user; with a single real account a faithful cutover is an empty
  crew (accept/deny/invite have no one to act on). Kept as local display data until there is
  real signup/auth for friends. Identity wiring is fixed (feed uses the hydrated user, not a
  hardcoded mock id). When real users exist: persist crew_members/crew_requests + make hang
  attendees reference real profiles (the snapshot can carry an optional member_id then).

## FeedRepository — DONE
- Solved with `activity.payload jsonb` (0004): each row stores a denormalized FeedItem
  snapshot, so cards render without joins and there's no per-viewer score ambiguity (score/
  name/author frozen at write time). `when` is recomputed from `created_at` on read.
  `postActivity` write-throughs from `feedStore.prepend`; `listFeed` reads payloads newest
  first; RLS limits to visible spots. Verified live.
- `new_spot` stays in the `FeedItem` union — it's used by **notifications**, not the feed
  (the feed never emits it; `postActivity` skips it defensively). Not a feed concern.
- Minor: no per-kind `check` constraint on `activity` (payload is the source of truth).

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
