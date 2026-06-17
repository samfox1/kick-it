import type { Hang, NewSpotItem, Spot } from '../domain/models';

/** Build a Spot for tests; override only what the test cares about. */
export function makeSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: 'spot-1',
    name: 'Test Spot',
    category: 'park',
    access: 'open',
    score: 7,
    distanceMi: 1,
    location: 'Somewhere',
    image: 'https://example.com/x.jpg',
    characteristicIds: [],
    ...overrides,
  };
}

/** Build a Hang for tests; override only what the test cares about. */
export function makeHang(overrides: Partial<Hang> = {}): Hang {
  return {
    id: 'hang-1',
    spotId: 'spot-1',
    author: { id: 'sam', name: 'Sam Fox', initial: 'S' },
    title: 'Sunset session',
    note: 'Good times.',
    image: 'https://example.com/hang.jpg',
    when: '2h ago',
    attendees: [],
    extraAttendees: 0,
    likes: 3,
    ...overrides,
  };
}

/** Build a new-spot feed item for tests; override only what the test cares about. */
export function makeFeedItem(overrides: Partial<NewSpotItem> = {}): NewSpotItem {
  return {
    kind: 'new_spot',
    id: 'feed-1',
    by: { id: 'marcus', name: 'Marcus', initial: 'M' },
    when: '2h ago',
    spotId: 'spot-1',
    spotName: 'Test Spot',
    category: 'park',
    location: 'Somewhere',
    access: 'open',
    score: 7,
    image: 'https://example.com/x.jpg',
    review: 'nice',
    characteristicIds: [],
    hangs: 0,
    saved: 0,
    ...overrides,
  };
}
