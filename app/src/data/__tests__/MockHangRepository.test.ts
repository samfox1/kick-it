import type { Hang } from '../../domain/models';
import { unwrap } from '../../test-utils/result';
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
    expect(unwrap(await repo.listForSpot('pontoon')).items.map((h) => h.id)).toEqual(['h1', 'h3']);
  });

  it('returns an empty list for a spot with no hangs', async () => {
    const repo = new MockHangRepository([mk('h1', 'pontoon')]);
    expect(unwrap(await repo.listForSpot('rooftop')).items).toEqual([]);
  });

  const draft = {
    spotId: 'pontoon',
    author: { id: 'sam', name: 'Sam', initial: 'S' },
    title: 'New hang',
    note: 'good times',
    image: 'x.jpg',
    attendees: [],
  };

  it('logHang stores a new hang and fills the server-owned fields', async () => {
    const repo = new MockHangRepository([]);
    const created = unwrap(await repo.logHang(draft));
    expect(created.id).toBeTruthy();
    expect(created.title).toBe('New hang');
    expect(created.likes).toBe(0);
    expect(created.extraAttendees).toBe(0);
    expect(created.when).toBeTruthy();
    const list = unwrap(await repo.listForSpot('pontoon')).items;
    expect(list.map((h) => h.id)).toContain(created.id);
  });

  it('logHang gives each new hang a distinct id', async () => {
    const repo = new MockHangRepository([]);
    const a = unwrap(await repo.logHang(draft));
    const b = unwrap(await repo.logHang(draft));
    expect(a.id).not.toBe(b.id);
  });

  it('logHang does not mutate the seed array passed to the constructor', async () => {
    const seed: Hang[] = [];
    const repo = new MockHangRepository(seed);
    await repo.logHang(draft);
    expect(seed).toHaveLength(0); // repo owns a copy; the caller's array is untouched
  });
});
