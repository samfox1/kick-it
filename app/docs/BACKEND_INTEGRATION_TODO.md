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
- TODO (from review): derive an explicit `isSignedIn` instead of overloading `profileStore.email`
  (the Apple/phone path may have no email), and rehydrate signed-in state on cold start (a real
  persisted session currently shows as guest until re-login). Low today, matters for the roadmap.

## Post-review hardening (2026-06-20)
- Identity-change now clears every per-user store (`spotsStore/hangsStore/feedStore.reset()`)
  before reloading, and `spotsStore.load` clears collections on error — fixes a cross-user
  spot leak when a reload failed mid sign-in/out.
- `auth.tsx` verify/send wrapped so `busy` can't stick; `_layout` bootstrap has a `.catch` so a
  thrown error can't hang the launch on a blank screen.
- RLS `is_real_user()` extended to USING (0006) so anon can't DELETE either; latent crew
  policies locked. `reportFailure` moved out of pure `result.ts` to `store/optimistic.ts`.

## Spot deletion — guarded, creator-only (done 2026-06-22)
- `delete_own_spot(p_spot_id)` RPC (0007, SECURITY DEFINER): deletes only if caller is the
  creator AND no one else has hung out / ranked / saved it (spots are communal + cascade, so a
  blanket delete would wipe others' data). Raises NOT_OWNER / SPOT_HAS_ENGAGEMENT / SPOT_NOT_FOUND.
- `Spot.creatorId` added (mapped from `spots.creator_id`); UI shows "Delete this spot" only to
  the creator (branded ConfirmModal; friendly error if engagement blocks it).
- Verified live: NOT_OWNER + SPOT_NOT_FOUND block; spot survives.
- Future: genuinely bad/spam spots = moderation (admin), separate from this user-facing delete.

## Review follow-ups (2026-06-23) — deferred, low-risk
- **SQL↔TS error coupling:** `deleteSpot` detects engagement via `error.message.includes('SPOT_HAS_ENGAGEMENT')`.
  Works (message is stable), but fragile to message changes/localization, and NOT_OWNER/NOT_FOUND
  collapse to a generic error. Harden later by raising with a custom SQLSTATE/`detail` and matching
  on `error.code`, or return a typed status from the RPC.
- **creatorId nullability:** `creator_id` is NOT NULL in the DB but `Spot.creatorId` is optional;
  could tighten to non-null (removes the defensive `spot.creatorId && isMe()` guard).
- **Profile save divergence:** `updateProfile` is fire-and-forget (logs on failure); identity-critical,
  so consider surfacing a retry like add-hang does.
- **Per-screen GPS:** `useLocationPermission` fetches a fix per screen (explore/spots/settings);
  lift into a store/context to fetch once if it spreads further.
- **Mock deleteSpot divergence:** mock is unconditionally permissive (no engagement guard); the
  delete failure branch is only exercised against Supabase. Fine for single-user; add a test if needed.

## Image uploads — Supabase Storage (done 2026-06-22)
- Public `media` bucket (0008) with per-user folders; public read, real-user-only upload into
  your own folder, owner-only update/delete (verified: guest upload blocked, public URL + bucket OK).
- `storage.ts`: `uploadImage`/`uploadImages` read local file URIs via `fetch(uri).arrayBuffer()`
  and upload, returning public URLs; remote URLs + empties pass through. `isLocalUri` tested.
- Wired into Supabase `createSpot` (cover + gallery) and `logHang` (photo): local device paths
  are uploaded and replaced with public URLs before insert, so images persist + load everywhere.
- Mock mode keeps local URIs (ephemeral, fine).
- DONE: **compression** — `lib/image.ts compressImage` caps width at 1280px + re-encodes JPEG
  ~0.7 (via expo-image-manipulator) when picking photos in add.tsx; falls back to original on error.
- DONE: **orphan cleanup** — `storage.removeImages`/`storagePathFromUrl` delete a content's Storage
  files when a hang (deleteHang) or spot (deleteSpot, after the RPC) is removed; best-effort,
  only touches our media-bucket URLs (seed/remote URLs ignored).

## Map — real map view (done 2026-06-23)
- `react-native-maps` (bundled in Expo Go): `SpotsMap.tsx` renders a real MapView with a marker
  per located spot + the brand callout card; tap marker → callout → open. `SpotsMap.web.tsx`
  keeps the stylized grid (react-native-maps has no web support; Metro picks per platform).
- iOS Expo Go uses Apple Maps with **no config/key**. TODO before Android/standalone builds:
  add a Google Maps API key (android.config.googleMaps.apiKey) + the react-native-maps config
  plugin + location usage strings; markers could become branded custom views later.

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
