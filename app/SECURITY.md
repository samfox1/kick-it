# Security & data handling

Status: **prototype**. Single mock user, no authentication, no network calls, no real personal
data. This doc states today's posture and what must change before real users.

## Today (mock build)

- **No accounts / no auth.** The app runs as one hard-coded "you" with a mock crew. There is no
  login, token, or session.
- **No backend.** All data comes from `src/data/mock/seed.ts` held in memory. Nothing is sent off
  the device; there is no API key or secret in the app.
- **Images** are remote placeholder URLs (picsum). No user photos are uploaded yet.
- **Trust boundary:** there isn't one yet — everything is local and fake. Treat all "users",
  "crews", and "endorsements" as fixtures, not data subjects.

## Before real users (when the backend lands)

The `SpotRepository` interface is the single seam where the network enters. When implementing a
real backend (e.g. Supabase), uphold:

- **Auth:** real sign-in; never trust a client-supplied user id. Scope every query to the
  authenticated user / their crew.
- **Access levels are authorization, not just UI.** `open` / `friends` / `invite` must be enforced
  server-side (row-level security), not only hidden in the client. An `invite` spot must be
  unreadable to non-members even via direct API calls.
- **Secrets** (API keys, service roles) live in server/edge config or EAS secrets — never in the
  app bundle or git. Use a public anon key with RLS for client reads.
- **User content** (photos, notes, names) is personal data: get consent, allow deletion, scrub
  EXIF/location from uploaded photos unless the user opts in, and serve over TLS.
- **Input from the client is untrusted** — validate spot/hang payloads server-side.
- **Camera/photo permissions** (expo-image-picker): request at point of use, explain why, degrade
  gracefully if denied.

## Reporting

Pre-release prototype — no disclosure process yet. Add one before any public distribution.
