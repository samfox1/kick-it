import type { FeedItem, Member } from '../../domain/models';
import { MockFeedRepository } from '../MockFeedRepository';
import type { FeedRepository } from '../FeedRepository';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

const marcus: Member = { id: 'marcus', name: 'Marcus', initial: 'M' };
const sara: Member = { id: 'sara', name: 'Sara', initial: 'S' };
const dev: Member = { id: 'dev', name: 'Dev', initial: 'D' };

// New spots are discovered on Explore, not the feed — the feed is hangs + rankings.
const FEED: FeedItem[] = [
  {
    kind: 'hang',
    id: 'f2',
    by: sara,
    when: 'Yesterday',
    spotId: 'pontoon',
    spotName: "Uncle Rick's Pontoon",
    access: 'invite',
    image: img('pontoon7'),
    note: 'Nine of us out on the lake til golden hour. Rick grilled, Dev brought the speaker. Best one yet.',
    attendees: [sara, marcus, dev],
    extraAttendees: 6,
    likes: 18,
  },
  {
    kind: 'ranked',
    id: 'f3',
    by: dev,
    when: '3h ago',
    spotId: 'basement',
    spotName: "Joey's Basement",
    category: 'basement',
    access: 'friends',
    score: 9.2,
    thumb: img('basement4'),
    rank: 1,
  },
];

export function createDefaultFeedRepository(): FeedRepository {
  return new MockFeedRepository(FEED);
}

export { FEED };
