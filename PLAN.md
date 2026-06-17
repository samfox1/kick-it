# Kick It — Product Plan & Prototype

> Beli, but for places to kick it with your friends.
> A social map of where your people actually hang — the basement, the bar patio,
> the park bench by the oak, your uncle's pontoon.

**Status:** Mock prototype, no backend. All data is fake. Target build: React Native.

---

## 1. The one-liner

Most apps rate places strangers can visit. Kick It rates the places *your crew*
already loves — and helps you find new ones. It's a shared, ranked, photo-rich
atlas of hangout spots, public and private, scored on the things that actually
matter when you're trying to chill.

## 2. Why it's not just "Beli for bars"

Beli works because restaurants are public. But the best hangs are often private:
a basement, a rooftop, a pontoon. Kick It embraces that with **access tags** and
a **hang ledger** — the soul of the product is memory and your people, not
discovery of strangers' favorites.

Three things make it ours:
1. **Access tags** — every spot is `open` / `friends-only` / `invite-only`.
2. **Attribute ratings** — 0–5 scores on the stuff that decides a hang
   (temperature, aux access, charging, cannabis-friendliness, privacy…).
3. **The Hang Ledger** (hero) — each spot accumulates a timeline of every time
   your crew kicked it there: photos, who came, a line about the night.

## 3. Core concepts & data model (mock)

### Spot
The central object. A place you can kick it.

| Field            | Example                                  |
|------------------|------------------------------------------|
| name             | "Uncle Rick's Pontoon"                    |
| access           | `open` \| `friends` \| `invite`           |
| category         | basement, patio, park, water, rooftop, lot|
| location         | "Lake Mendota" (display only, no real geo)|
| addedBy          | a crew member                             |
| photos[]         | film-style images                         |
| overallScore     | 0–10, derived from pairwise ranking       |
| attributes{}     | 0–5 per characteristic (see below)        |
| hangs[]          | the ledger (photos + note + who + date)   |
| savedBy[]        | crew members who bookmarked it            |

### Attribute schema (0–5 each)
Grouped into four families; a spot's profile is its "fingerprint."

- **Comfort & climate** — temperature regulation, seating comfort, shade/shelter, bug situation
- **Vibe & substances** — cannabis compatibility, noise tolerance, BYOB friendliness, privacy
- **Tech & utility** — aux/speaker access, charging/outlets, wifi, bathroom, parking
- **Access & logistics** — cost (free→$$), capacity, best time of day, food nearby

### Rating mechanic
Like Beli: you don't pick a number. After visiting, you answer
**"Which did you like better?"** against spots you've already ranked. That
produces a personal **ranked list** and a **0–10 score**. Attribute ratings are
entered separately as quick 0–5 taps during the Add flow.

### Crew / Social
- A **crew** is your friend group. Feed and friends-only spots are scoped to it.
- Social actions: add a spot, log a hang, rate, comment, save, react.

## 4. Screens (the prototype)

| Screen          | Purpose                                                            |
|-----------------|-------------------------------------------------------------------|
| **Feed**        | Home. Activity from your crew: new spots, hangs, re-ranks. Each post shows the opening line of that person's review/story. |
| **Explore**     | Swipeable discovery of new nearby spots. Swipe right = save to my spots. |
| **Spots**       | Two toggles: **Local spots ↔ My spots**, each viewable as **List ↔ Map**. "+" adds a local spot to your own map. |
| **Spot detail** | The full profile: photos, fingerprint, access, and the Hang Ledger.|
| **Add spot**    | The signature input: photos → access → attributes → pairwise rank. |
| **Profile**     | Your ranked list, stats, crew, saved spots.                        |

Bottom nav: a **floating white pill** with Lucide line icons (active = blue) and a
**blue ( + )** button — Feed · Explore · ( + ) · Spots · You.

## Visual style (locked)

White base, **Inter**, ink (#111) linework with hard offset shadows, rounded
cards. **No emoji — Lucide line icons** throughout. Signature elements:
- **Score = a speech bubble, colored by its value** — 10 = green → 0 = red.
- **Rotated sticker tags** for access ("Friends only") and flags ("#1 pick").
- **Semantic category colors** on characteristic badges:
  Outdoors (green) · Vibe (purple) · **Features** (blue) · Access (amber).
- **Score-forward ranking rows:** lists lead with the score; tags/badges reveal
  on tap so they don't compete with the number.

Design was explored over several rounds in `mock/looks*.html` (kept for reference).

## 5. The signature flows

**Add a spot (multi-step):**
1. Photos + name + category
2. Access tag (open / friends / invite)
3. Attribute ratings (tap 0–5 across the four families)
4. Description + first hang note
5. Pairwise rank ("better than Cedar Bench? better than The Tin Roof?") → score

**Log a hang (feeds the ledger):**
From a spot → "Log a hang" → photos + who was there + one line → appended to the
ledger and pushed to the feed.

## 6. What's mocked vs. real

- **Mocked:** all spots, crew, photos, scores, map (static image with pins).
- **Faked interactions:** taps navigate between pages; ranking shows a canned
  result; no persistence.
- **Deferred (post-mock):** real auth, geo/map SDK, image upload, the actual
  ranking algorithm, notifications, crew invites.

## 7. React Native build notes (later)

- **Navigation:** React Navigation — bottom tabs + native stack per tab.
- **State:** start with local mock JSON + Zustand; swap to a real API later.
- **Lists:** FlashList for feed/explore performance.
- **Components to reuse:** `SpotCard`, `AttributeFingerprint`, `AccessBadge`,
  `HangLedgerItem`, `ScorePill`, `RankCompare`.
- **Design tokens** mirror the prototype's CSS variables (palette, radius, type).

## 8. Prototype files

```
mock/
  index.html      → entry: opens the phone with the Feed
  styles.css      → shared design system (locked look)
  app.js          → shared behavior: builds the nav, colors score bubbles,
                    tap-to-expand rows, badge select/endorse
  feed.html       → home activity feed (review snippets)
  explore.html    → swipeable discovery cards
  spots.html      → Local/My spots, score-forward rows (tap to expand)
  spot.html       → spot detail: vouch badges + Hang Ledger (hero)
  add.html        → add-spot multi-step flow (badge tagging + pairwise rank)
  profile.html    → ranked list (score-forward) + stats + crew
  looks*.html     → design-exploration galleries (reference only)
```

Open `mock/index.html` in a browser and tap through. Phone-framed, links wired.
