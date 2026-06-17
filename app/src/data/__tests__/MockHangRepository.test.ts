import type { Hang } from '../../domain/models';
import { MockHangRepository } from '../MockHangRepository';

const mk = (id: string, spotId: string): Hang => ({
  id,
  spotId,
  author: { id: 'marcus', name: 'Marcus', initial: 'M' },
  title: 'A hang',
  note: 'note',
  image: 'x.jpg',
  when: 'Jun 9',
  attendees: [],
  extraAttendees: 0,
  likes: 0,
});

describe('MockHangRepository', () => {
  it('lists hangs for a given spot, preserving order', async () => {
    const repo = new MockHangRepository([
      mk('h1', 'pontoon'),
      mk('h2', 'basement'),
      mk('h3', 'pontoon'),
    ]);
    expect((await repo.listForSpot('pontoon')).map((h) => h.id)).toEqual(['h1', 'h3']);
  });

  it('returns an empty list for a spot with no hangs', async () => {
    const repo = new MockHangRepository([mk('h1', 'pontoon')]);
    expect(await repo.listForSpot('rooftop')).toEqual([]);
  });
});
