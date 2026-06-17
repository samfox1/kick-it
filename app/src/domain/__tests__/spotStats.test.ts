import { hangCountForSpot } from '../spotStats';
import type { Hang } from '../models';

const hang = (id: string, spotId: string): Hang => ({
  id,
  spotId,
  author: { id: 'm', name: 'M', initial: 'M' },
  title: 't',
  note: 'n',
  image: 'x',
  when: 'now',
  attendees: [],
  extraAttendees: 0,
  likes: 0,
});

describe('hangCountForSpot', () => {
  it('counts only hangs logged at that spot', () => {
    const hangs = [hang('h1', 'a'), hang('h2', 'b'), hang('h3', 'a')];
    expect(hangCountForSpot(hangs, 'a')).toBe(2);
    expect(hangCountForSpot(hangs, 'z')).toBe(0);
  });
});
