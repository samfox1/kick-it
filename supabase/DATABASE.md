# Kick It — Database Reference

The **entire database is defined by the migrations in `supabase/migrations/`** (0001–0010).
They are version-controlled, so the schema is never lost even if the Supabase project is paused,
wiped, or deleted.

## Recreate the whole backend from scratch

If the project is gone or you start a fresh Supabase project:

```bash
# 1. Link the local repo to the (new or existing) project
supabase link --project-ref <your-project-ref>

# 2. Apply every migration in order -> recreates all structure below
supabase db push
```

That rebuilds **everything** structural: tables, enums, indexes, RLS policies, functions/RPCs,
the Storage bucket, grants, and the seeded characteristics catalog.

What is **NOT** restored (it's data, not structure): user accounts in `auth.users`, `profiles`
rows, and any user-created spots/hangs/rankings. Auth settings (email OTP, anonymous sign-in,
SMTP) are dashboard config, not migrations — see "Dashboard settings" below.

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per user (the app's `Member` + profile). FK to `auth.users`. | `id`, `name`, `initial`, `handle` (unique), `avatar` |
| `crew_members` | Directed friend edge: `owner` counts `member` as crew. | `(owner_id, member_id)` |
| `crew_requests` | Pending crew join requests. | `(owner_id, requester_id)` |
| `characteristics` | Fixed global catalog of the 18 traits (seeded). | `id`, `label`, `category` |
| `spots` | Shared/global places, created by a user. | `id`, `creator_id`, `name`, `category`, `access`, `lat/lng`, `image`, `images[]`, `characteristic_ids[]` |
| `saved_spots` | Per-user bookmarks ("want to kick it"). | `(user_id, spot_id)` |
| `rankings` | Per-user ranked list. `position` (0=best) is source of truth; score derived on client. | `(user_id, spot_id)`, `position` (unique per user) |
| `endorsements` | Per-user characteristic vouches (vouchCounts = COUNT). | `(user_id, spot_id, characteristic_id)` |
| `preferences` | Discovery filter. | `user_id`, `max_distance_mi`, `non_negotiables[]` |
| `hangs` | The ledger of hangouts; authored by a user. Attendees are a denormalized `jsonb` snapshot. | `id`, `spot_id`, `author_id`, `title`, `note`, `image`, `attendees` (jsonb), `extra_attendees` |
| `reactions` | Per-user reactions (likes = COUNT where key='heart'). | `(user_id, hang_id, key)` |
| `activity` | Immutable feed log; full FeedItem stored as `payload` jsonb snapshot. | `id`, `kind`, `actor_id`, `spot_id`, `hang_id`, `rank`, `payload` |

### Enums
- `access_level`: `open` \| `friends` \| `invite`
- `char_category`: `outdoors` \| `vibe` \| `features` \| `access`
- `reaction_key`: `heart` \| `fire` \| `haha`
- `activity_kind`: `hang` \| `ranked`

## Functions / RPCs
| Function | Security | Purpose |
|---|---|---|
| `can_view(owner, lvl)` | DEFINER | Visibility helper: open→everyone; friends/invite→owner + owner's crew. Used in RLS. |
| `is_real_user()` | — | True when the JWT is **not** anonymous. Gates content writes (defense in depth). |
| `set_rankings(uuid[])` | INVOKER | Rewrites the caller's ranked list in one tx (delete-then-insert; avoids unique-position shuffle). |
| `delete_own_spot(uuid)` | DEFINER | Creator-only spot delete, **blocked if anyone else engaged** (so cascades can't wipe others' data). |

## Security model (RLS) — the short version
- **Browse is open; contributing needs a real account.** Every content-write policy requires
  `auth.uid()` ownership **and** `is_real_user()` (anonymous guests can read + set their own
  profile/preferences, but cannot create spots/hangs/rankings/reactions/activity).
- **Spots/hangs/feed visibility** runs through `can_view()` — `open` to all, `friends`/`invite`
  to the owner and their crew.
- **Per-user tables** (`saved_spots`, `rankings`, `endorsements`, `preferences`, `reactions`)
  are strictly scoped to `user_id = auth.uid()`.

## Storage
- Public bucket **`media`** for spot/hang photos.
- Files live under a per-user folder `{uid}/...`.
- Public read; only a real (non-anon) user can upload into their own folder and manage their
  own files.

## Dashboard settings (NOT in migrations — reconfigure manually on a fresh project)
- **Auth → Providers**: Email OTP enabled, OTP length **6**, "Confirm email" off (uses code, not link).
- **Auth → Anonymous sign-ins**: enabled.
- **Auth → SMTP** (optional): custom SMTP (e.g. Resend) + a Magic Link template using `{{ .Token }}`.
- **Data API**: on; "auto-expose new tables" off (migrations grant the API roles explicitly).

## App connection
The app reads `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `app/.env.local`,
and uses Supabase only when `EXPO_PUBLIC_USE_SUPABASE=true`. The **anon key is safe** to commit;
the **service_role key must never** be in the app or committed.
