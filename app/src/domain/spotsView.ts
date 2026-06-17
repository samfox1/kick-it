import type { Preferences, Spot } from './models';
import { filterSpots } from './preferences';
import { sortByScoreDesc } from './ranking';

/** Local spots a user should see: filtered by their preferences, ranked high→low. */
export function visibleLocalSpots(spots: Spot[], prefs: Preferences): Spot[] {
  return sortByScoreDesc(filterSpots(spots, prefs));
}

/**
 * A user's own spots in rank order. The array order IS the ranking (the store keeps
 * it that way and derives scores from position), so this is a passthrough — kept as a
 * named view so screens don't reach into store internals.
 */
export function visibleMySpots(spots: Spot[]): Spot[] {
  return spots;
}
