import type { Preferences, Spot } from './models';
import { filterSpots } from './preferences';
import { sortByScoreDesc } from './ranking';

/** Local spots a user should see: filtered by their preferences, ranked high→low. */
export function visibleLocalSpots(spots: Spot[], prefs: Preferences): Spot[] {
  return sortByScoreDesc(filterSpots(spots, prefs));
}

/** A user's own spots, ranked high→low. */
export function visibleMySpots(spots: Spot[]): Spot[] {
  return sortByScoreDesc(spots);
}
