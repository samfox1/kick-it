import type { FeedItem, Hang, HangItem, Member, RankedItem, Spot } from './models';

const FEED_KINDS = ['new_spot', 'hang', 'ranked'];

/** Validate an untrusted feed payload (e.g. jsonb from the backend) before it's rendered.
 *  Returns the item if it has a known discriminant + required base fields, else null. */
export function parseFeedItem(value: unknown): FeedItem | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.kind !== 'string' || !FEED_KINDS.includes(v.kind)) return null;
  if (typeof v.id !== 'string' || typeof v.spotId !== 'string') return null;
  return value as FeedItem;
}

/** Build a feed post from a logged hang and the spot it happened at. */
export function hangToFeedItem(hang: Hang, spot: Pick<Spot, 'name' | 'access'>): HangItem {
  return {
    kind: 'hang',
    id: `feed-${hang.id}`,
    by: hang.author,
    when: hang.when,
    spotId: hang.spotId,
    spotName: spot.name,
    access: spot.access,
    image: hang.image,
    note: hang.note,
    attendees: hang.attendees,
    extraAttendees: hang.extraAttendees,
    likes: hang.likes,
  };
}

/** Build a feed post for ranking a spot at a given rank. */
export function rankingToFeedItem(by: Member, spot: Spot, rank: number): RankedItem {
  return {
    kind: 'ranked',
    id: `feed-rank-${spot.id}-${rank}`,
    by,
    when: 'Just now',
    spotId: spot.id,
    spotName: spot.name,
    category: spot.category,
    access: spot.access,
    score: spot.score,
    thumb: spot.image,
    rank,
  };
}
