import { haversineMeters } from './geo';
import type { Spot } from './models';

/** A possible duplicate of a spot being added, with how it matched. */
export interface DuplicateMatch {
  spot: Spot;
  /** Distance from the new spot's location, in meters. */
  meters: number;
  /** Name overlap, 0–1 (token Jaccard). 1 means the names are effectively identical. */
  nameScore: number;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * How similar two spot names are, 0–1, by shared normalized words (token Jaccard).
 * Case- and punctuation-insensitive. Used to rank duplicate candidates — never as the
 * sole signal, since people name casual spots generically ("the roof", "the spot").
 */
const tokens = (s: string) =>
  new Set(
    normalize(s)
      .split(' ')
      .filter((t) => t.length > 1),
  );

export function nameSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  const intersection = [...ta].filter((t) => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Existing spots that might be the same place as the one being added. Location is the
 * primary signal: any catalog spot within `radiusM` of the draft is a candidate, sorted
 * closest first. Name similarity rides along so a same-named neighbor stands out, but is
 * never required (and images are deliberately not used — same place, different angle ≠ match).
 *
 * Spots without coordinates can't be matched and are skipped.
 */
export function findDuplicateCandidates(
  catalog: Spot[],
  draft: { name: string; lat: number; lng: number },
  radiusM = 150,
): DuplicateMatch[] {
  return catalog
    .filter((s): s is Spot & { lat: number; lng: number } => s.lat != null && s.lng != null)
    .map((s) => ({
      spot: s,
      meters: haversineMeters(draft, { lat: s.lat, lng: s.lng }),
      nameScore: nameSimilarity(draft.name, s.name),
    }))
    .filter((m) => m.meters <= radiusM)
    .sort((a, b) => a.meters - b.meters);
}
