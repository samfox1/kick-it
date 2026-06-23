import type { FeedItem } from '../../domain/models';
import { MockFeedRepository } from '../MockFeedRepository';
import type { FeedRepository } from '../FeedRepository';
import { CREW } from './profile';

const photo = (keywords: string, id: number) => `https://picsum.photos/id/${id}/600/400`;

// Reuse the avatar'd crew so members look the same across feed / hangs / crew.
const [marcus, sara, dev] = CREW;

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
    image: photo('lake,pontoon,boat', 101),
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
    thumb: photo('basement,game,room', 110),
    rank: 1,
  },
];

export function createDefaultFeedRepository(): FeedRepository {
  return new MockFeedRepository(FEED);
}

export { FEED };
