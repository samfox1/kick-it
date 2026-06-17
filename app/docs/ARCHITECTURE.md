# Architecture

Layered, with **deep modules behind narrow interfaces**. Dependencies point inward:
UI → store → domain, and data is reached only through an interface.

```
src/
  domain/        Pure business logic + types. No React, no I/O. Fully unit-tested (TDD).
    models.ts          Spot, Characteristic, Preferences, AccessLevel, CategoryKey
    score.ts           scoreColor(score) → hsl string (10=green … 0=red)
    ranking.ts         sortByScoreDesc(spots)
    preferences.ts     filterSpots(spots, prefs)  (distance + non-negotiables)
    spotsView.ts       visibleLocalSpots / visibleMySpots  (filter ∘ sort composition)
    characteristics.ts CHARACTERISTICS catalog + getCharacteristic(id)
    feedView.ts        visibleFeed(items, friendIds)  (friends-only feed gating)
    exploreView.ts     exploreCatalog / nearbySpots / crewSpots  (Explore tabs + filters)
    geo.ts             haversineMeters(a, b)  (great-circle distance)
    dedupe.ts          findDuplicateCandidates / nameSimilarity  (see docs/DEDUPE.md)
    search.ts          searchSpots(spots, query)  (name/location/category match)
    spotStats.ts       hangCountForSpot (real) / saveCountForSpot (mock)
  data/          Data access behind a contract; swappable.
    SpotRepository.ts      interface (listLocal / listMine / getById) — all async
    MockSpotRepository.ts  in-memory impl over injected seed
    mock/seed.ts           seed data + createDefaultSpotRepository()
  store/         App state (Zustand). spotsStore wires the repository + preferences to screens.
  theme/         Design tokens (colors, spacing, radii, shadows, category colors, Inter fonts).
  ui/            Presentational components: ScoreBubble, CategoryBadge, AccessSticker, SpotRow,
                 Segmented, TabBar (floating pill + blue +), Placeholder.
  app/           expo-router routes: _layout (fonts + providers), index (→ Spots for now),
                 (tabs)/{feed,explore,spots,profile}, add, spot/[id].
  test-utils/    Test factories (e.g. makeSpot). Not shipped.

Status: the core app is built end-to-end (domain → repo → store → screen, each with a smoke test):
the doodle **Landing** (app entry, animated `FloatingDoodle`s → Feed), **Feed**, **Spots**,
**Spot detail**, the **Add flow** (pure `rankInsert` pairwise ranking + `expo-image-picker`
camera), **Profile**, and **Explore** (swipe-discovery deck over `discoverableSpots`). All five
tabs + landing + spot detail + add are built — no placeholders remain.
```

## Why this shape

- **Domain is pure** → trivially testable, no mocks, fast. Logic that matters (scoring,
  ranking, filtering) is proven independent of React/Expo.
- **`SpotRepository` interface** hides whether data is mock or a real backend. Swapping to
  Supabase later means writing one new implementation — screens and store don't change.
  See `docs/adr/0002-mock-data-swap-ready.md`.
- **Composition over config** → `spotsView` composes `filterSpots` + `sortByScoreDesc` rather
  than each screen re-deriving it.

## How to add a feature (the loop we follow)

1. **Model it** in `domain/models.ts` if new types are needed.
2. **TDD the logic**: write a failing test in `__tests__/`, watch it fail, implement minimally,
   watch it pass. Pure functions in `domain/`; data behavior in `data/`.
3. **Wire the store** to expose it to screens.
4. **Build the screen** in `app/`, using `ui/` components + `theme/` tokens. Add a render/
   interaction **smoke test** (React Native Testing Library).
5. **Update docs**: this file, `CONTEXT.md`, and `SECURITY.md` if trust boundaries shift.

**Definition of done:** tests green, `npm run typecheck` clean, docs touched.

## Testing

- Runner: **Jest** (`jest-expo` preset) + **React Native Testing Library**.
- Strategy: full TDD coverage on `domain/` + `data/`; lightweight smoke tests for screens.
- Test files live in `__tests__/` next to the code; factories in `src/test-utils/`.
