import type { Preferences, Spot } from './models';

/**
 * Filters local spots by a user's preferences: within `maxDistanceMi` AND
 * containing every characteristic in `nonNegotiables`. Returns a new array.
 */
export function filterSpots(spots: Spot[], prefs: Preferences): Spot[] {
  return spots.filter((spot) => {
    if (spot.distanceMi > prefs.maxDistanceMi) return false;
    return prefs.nonNegotiables.every((id) => spot.characteristicIds.includes(id));
  });
}
