import type { FeedItem } from '../domain/models';
import type { FeedRepository } from './FeedRepository';

/** In-memory FeedRepository backed by seed items. */
export class MockFeedRepository implements FeedRepository {
  constructor(private readonly items: FeedItem[]) {}

  async listFeed(): Promise<FeedItem[]> {
    return this.items;
  }
}
