import { visibleFeed } from '../feedView';
import { makeFeedItem } from '../../test-utils/factories';

const friend = { id: 'marcus', name: 'Marcus', initial: 'M' };
const stranger = { id: 'rando', name: 'Rando', initial: 'R' };

describe('visibleFeed', () => {
  it('always shows open posts, even from strangers', () => {
    const items = [makeFeedItem({ id: 'a', by: stranger, access: 'open' })];
    expect(visibleFeed(items, ['marcus']).map((i) => i.id)).toEqual(['a']);
  });

  it('hides friends-only posts from people who are not your friends', () => {
    const items = [makeFeedItem({ id: 'a', by: stranger, access: 'friends' })];
    expect(visibleFeed(items, ['marcus'])).toEqual([]);
  });

  it('shows friends-only posts from your friends', () => {
    const items = [makeFeedItem({ id: 'a', by: friend, access: 'friends' })];
    expect(visibleFeed(items, ['marcus']).map((i) => i.id)).toEqual(['a']);
  });

  it('treats invite-only the same as friends-only — hidden unless the poster is a friend', () => {
    const items = [
      makeFeedItem({ id: 'a', by: stranger, access: 'invite' }),
      makeFeedItem({ id: 'b', by: friend, access: 'invite' }),
    ];
    expect(visibleFeed(items, ['marcus']).map((i) => i.id)).toEqual(['b']);
  });

  it('preserves order and filters a mixed feed', () => {
    const items = [
      makeFeedItem({ id: 'a', by: stranger, access: 'open' }),
      makeFeedItem({ id: 'b', by: stranger, access: 'friends' }),
      makeFeedItem({ id: 'c', by: friend, access: 'friends' }),
    ];
    expect(visibleFeed(items, ['marcus']).map((i) => i.id)).toEqual(['a', 'c']);
  });
});
