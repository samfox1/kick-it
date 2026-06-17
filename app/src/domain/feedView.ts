import type { FeedItem } from './models';

/**
 * The feed you're allowed to see. Open posts are public; `friends`- and `invite`-only
 * posts surface only when the poster is in your crew (`friendIds`). Include your own id
 * in `friendIds` so your own private posts show up. Order is preserved.
 */
export function visibleFeed(items: FeedItem[], friendIds: string[]): FeedItem[] {
  const crew = new Set(friendIds);
  return items.filter((item) => item.access === 'open' || crew.has(item.by.id));
}
