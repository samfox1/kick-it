# Kick It — domain glossary

The shared language of the app. Keep code names aligned with these terms.

- **Spot** — a place to kick it. Has a `score` (0–10), `access`, `distanceMi`, a `category`
  (park, bar patio, rooftop, basement, on water, backyard, lot, waterfront…), and a set of
  vouched **characteristics**. The central object.
- **Score** — a 0–10 number for how good a spot is (Beli-style, from pairwise ranking later).
  Rendered as a **speech bubble colored by value**: 10 = green → 0 = red (`scoreColor`).
- **Access** — who can find a spot: `open` (anyone), `friends` (your crew), `invite` (hidden).
- **Characteristic** — a taggable/endorsable trait (e.g. "Aux access", "Cannabis ok"), each in
  one **category**.
- **Category** — the four characteristic families, each with a semantic UI color:
  **Outdoors** (green) · **Vibe** (purple) · **Features** (blue) · **Access** (amber).
- **Non-negotiable** — a characteristic a user *requires*; spots without it are filtered out of
  Local spots.
- **Preferences** — a user's Local-spots filter: `maxDistanceMi` + `nonNegotiables[]`.
- **Local spots** vs **My spots** — discoverable nearby spots vs the spots you've saved/ranked.
  Both are shown ranked, score descending.
- **Hang** — a single hangout logged at a spot (photos + note + who came). A spot accumulates a
  **Hang Ledger** over time. *(Hero feature; modeled in a later slice.)*
- **Crew** — your friend group (default "The Regulars"). Single mock user for now, no auth.
- **Vouch / endorse** — crew members confirm a spot's characteristics; counts show what's true.
