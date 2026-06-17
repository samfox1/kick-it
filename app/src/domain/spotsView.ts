import type { Preferences, Spot } from './models';
import { filterSpots } from './preferences';
import { sortByScoreDesc } from './ranking';

/**
 * Local spots to discover: filtered by preferences and ranked high→low, excluding any
 * already in your collection (`ownedIds` = saved + ranked) so every one is savable.
 */
export function visibleLocalSpots(
  spots: Spot[],
  prefs: Preferences,
  ownedIds: string[] = [],
): Spot[] {
  const owned = new Set(ownedIds);
  return sortByScoreDesc(filterSpots(spots, prefs).filter((s) => !owned.has(s.id)));
}

/**
 * A user's own spots in rank order. The array order IS the ranking (the store keeps
 * it that way and derives scores from position), so this is a passthrough — kept as a
 * named view so screens don't reach into store internals.
 */
export function visibleMySpots(spots: Spot[]): Spot[] {
  return spots;
}
