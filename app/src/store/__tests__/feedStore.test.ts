import { useFeedStore } from '../feedStore';
import { hangToFeedItem, rankingToFeedItem } from '@/domain/feedItem';
import { makeHang, makeSpot } from '../../test-utils/factories';

describe('feedStore.prepend', () => {
  beforeEach(() => useFeedStore.setState({ items: [], loaded: true, error: null }));

  it('puts a hang item at the top of the feed', () => {
    const item = hangToFeedItem(makeHang({ id: 'h1', spotId: 'x' }), {
      name: 'Cool Spot',
      access: 'open',
    });
    useFeedStore.getState().prepend(item);
    expect(useFeedStore.getState().items[0]).toBe(item);
  });

  it('keeps the newest item first across multiple prepends', () => {
    const ranked = rankingToFeedItem(
      { id: 'sam', name: 'Sam Fox', initial: 'S' },
      makeSpot({ id: 'y' }),
      1,
    );
    const hang = hangToFeedItem(makeHang({ id: 'h2', spotId: 'z' }), { name: 'Z', access: 'open' });
    useFeedStore.getState().prepend(ranked);
    useFeedStore.getState().prepend(hang);
    expect(useFeedStore.getState().items[0]).toBe(hang);
    expect(useFeedStore.getState().items[1]).toBe(ranked);
  });
});
