# Preventing duplicate spots

Beli works because a restaurant has one canonical identity (a Google/Foursquare place,
an address, a phone number). A Kick It spot — a friend's basement, a park bench, an uncle's
pontoon — often has **no public identity**. So we can't lean on a places database; we build
our own duplicate check, and we run it **at creation time**, not as cleanup later.

## The signals, ranked

1. **Location — primary.** Two "the roof" 50 ft apart are the same place; two 10 mi apart
   are not. Every spot carries optional `lat`/`lng` (`Spot` in `domain/models.ts`).
2. **Name — secondary, ranking only.** People name casual spots generically ("the spot",
   "the bench"), so name is never sufficient on its own. We normalize (lowercase, strip
   punctuation, drop 1-char tokens like the `'s` in "Joey's") and score token overlap.
3. **Images — deliberately not used for matching.** The same patio shot from two angles
   produces completely different hashes. Photos help the *human* decide ("is this the same
   place?"); a real backend may perceptual-hash only to catch literal re-uploads.

## The flow

`findDuplicateCandidates(catalog, { name, lat, lng }, radiusM = 150)` in `domain/dedupe.ts`:

- Keeps catalog spots **within `radiusM`** of the new spot's pinned location (`haversineMeters`
  from `domain/geo.ts`), **closest first**.
- Attaches `nameScore` (0–1, `nameSimilarity`) so a same-named neighbor stands out.
- Skips spots without coordinates.

In the Add flow (`app/add.tsx`), once you name the spot and **pin its location**, any
candidates appear as **"Is it one of these?"** — tap one to add your hang to the existing
spot instead of creating a duplicate, or confirm yours is new and continue.

## Private spots get a shortcut

`friends`/`invite` spots have an owner/host in the real model — you don't *re-create*
someone's basement, you're invited to it. That socially eliminates most private duplicates,
which is the class hardest to match on coordinates alone.

## Backstop

A future community "this is a duplicate → merge" report handles the few that slip through,
wiki-style.

## Mock vs. real

- **Mock:** the Add flow pins a fixed `DEMO_LOCATION` near the seeded spot cluster (or the
  device GPS if granted) so the candidate UI is demoable. Seed spots have coordinates in
  `data/mock/seed.ts`.
- **Real:** swap the pin for a map picker / GPS, and point `findDuplicateCandidates` at a
  spatial query (e.g. PostGIS `ST_DWithin`). The matcher and UI don't change.
