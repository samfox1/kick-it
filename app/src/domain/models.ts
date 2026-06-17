/** Core domain types for Kick It. Pure data contracts — no React, no I/O. */

/** Who can find a spot. */
export type AccessLevel = 'open' | 'friends' | 'invite';

/** The four characteristic families, each with its own semantic color in the UI. */
export type CategoryKey = 'outdoors' | 'vibe' | 'features' | 'access';

/** A taggable/endorsable trait of a spot (e.g. "Aux access"). */
export interface Characteristic {
  id: string;
  label: string;
  category: CategoryKey;
}

/** A place to kick it. `score` is 0–10; `distanceMi` is from the user. */
export interface Spot {
  id: string;
  name: string;
  category: string;
  access: AccessLevel;
  score: number;
  distanceMi: number;
  location: string;
  /** Geographic coordinates, used to detect duplicate spots near the same place. */
  lat?: number;
  lng?: number;
  /** Cover photo — used for list rows, feed thumbs, and gallery fallback. */
  image: string;
  /** Full photo gallery, in order. When absent, the gallery is just `[image]`. */
  images?: string[];
  /** Characteristic ids the crew has vouched for on this spot. */
  characteristicIds: string[];
  /** Community endorsement count per characteristic id. Attached by the repository
   *  (a backend returns it in the payload); absent on locally-built spots. */
  vouchCounts?: Record<string, number>;
  description?: string;
}

/** A spot's photos as a gallery: the explicit `images`, else just the cover. */
export function spotGallery(spot: Pick<Spot, 'image' | 'images'>): string[] {
  return spot.images && spot.images.length > 0 ? spot.images : [spot.image];
}

/** A reaction a crew member can leave on a hang. */
export type ReactionKey = 'heart' | 'fire' | 'haha';

/** A single logged hangout at a spot (builds a spot's Hang Ledger). */
export interface Hang {
  id: string;
  spotId: string;
  /** Who posted this hang story. Always attributed — no anonymous posts. */
  author: Member;
  title: string;
  note: string;
  image: string;
  when: string;
  attendees: Member[];
  extraAttendees: number;
  likes: number;
}

/** A user's filter for which local spots to surface. */
export interface Preferences {
  maxDistanceMi: number;
  /** Characteristic ids a spot MUST have to be shown. */
  nonNegotiables: string[];
}

/** A crew member (single mock user world for now). */
export interface Member {
  id: string;
  name: string;
  /** Initial shown in the avatar. */
  initial: string;
}

interface FeedBase {
  id: string;
  by: Member;
  when: string;
  spotId: string;
  spotName: string;
}

/** Someone added a new spot. */
export interface NewSpotItem extends FeedBase {
  kind: 'new_spot';
  category: string;
  location: string;
  access: AccessLevel;
  score: number;
  image: string;
  review: string;
  characteristicIds: string[];
  /** How many hangs have been logged at this spot. */
  hangs: number;
  /** How many people have saved this spot. */
  saved: number;
}

/** Someone logged a hang at a spot. */
export interface HangItem extends FeedBase {
  kind: 'hang';
  access: AccessLevel;
  image: string;
  note: string;
  attendees: Member[];
  extraAttendees: number;
  likes: number;
}

/** Someone (re)ranked a spot. */
export interface RankedItem extends FeedBase {
  kind: 'ranked';
  category: string;
  access: AccessLevel;
  score: number;
  thumb: string;
  rank: number;
}

/** An activity-feed entry. */
export type FeedItem = NewSpotItem | HangItem | RankedItem;
