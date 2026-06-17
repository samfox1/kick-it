import type { FeedItem } from '../../domain/models';
import { unwrap } from '../../test-utils/result';
import { MockFeedRepository } from '../MockFeedRepository';

const item: FeedItem = {
  kind: 'ranked',
  id: 'f1',
  by: { id: 'm', name: 'Marcus', initial: 'M' },
  when: '2h ago',
  spotId: 'rooftop',
  spotName: "Marcus's Rooftop",
  category: 'rooftop',
  access: 'friends',
  score: 8.9,
  thumb: 'x.jpg',
  rank: 1,
};

describe('MockFeedRepository', () => {
  it('lists feed items in the order given', async () => {
    const repo = new MockFeedRepository([item, { ...item, id: 'f2' }]);
    expect(unwrap(await repo.listFeed()).items.map((i) => i.id)).toEqual(['f1', 'f2']);
  });
});
