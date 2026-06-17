import type { FeedItem } from '../domain/models';

/** Narrow contract for the activity feed. Swap the mock for a backend later — screens unchanged. */
export interface FeedRepository {
  listFeed(): Promise<FeedItem[]>;
}
