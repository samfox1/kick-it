import { rowToHang, rowToSpot, timeAgo, type HangRow, type SpotRow } from '../mappers';

const fullRow: SpotRow = {
  id: 'abc',
  name: 'Cool Spot',
  category: 'park',
  access: 'open',
  location: 'Eastside',
  lat: 43.1,
  lng: -89.4,
  image: 'cover.jpg',
  images: ['a.jpg', 'b.jpg'],
  characteristic_ids: ['aux', 'free'],
  description: 'nice',
};

describe('rowToSpot', () => {
  it('maps snake_case columns to the Spot domain shape', () => {
    expect(rowToSpot(fullRow)).toEqual({
      id: 'abc',
      name: 'Cool Spot',
      category: 'park',
      access: 'open',
      score: 0, // derived from rank later
      distanceMi: 0, // computed from viewer location later
      location: 'Eastside',
      lat: 43.1,
      lng: -89.4,
      image: 'cover.jpg',
      images: ['a.jpg', 'b.jpg'],
      characteristicIds: ['aux', 'free'],
      description: 'nice',
    });
  });

  it('defaults nullable columns sensibly', () => {
    const sparse: SpotRow = {
      id: 'x',
      name: 'Bare',
      category: 'lot',
      access: 'friends',
      location: null,
      lat: null,
      lng: null,
      image: '',
      images: null,
      characteristic_ids: null,
      description: null,
    };
    const spot = rowToSpot(sparse);
    expect(spot.location).toBe('');
    expect(spot.lat).toBeUndefined();
    expect(spot.lng).toBeUndefined();
    expect(spot.images).toBeUndefined();
    expect(spot.characteristicIds).toEqual([]);
    expect(spot.description).toBeUndefined();
  });
});

describe('timeAgo', () => {
  const now = 1_000_000_000_000;
  it('formats recent times in a human, relative way', () => {
    expect(timeAgo(new Date(now - 30 * 1000).toISOString(), now)).toBe('Just now');
    expect(timeAgo(new Date(now - 5 * 60 * 1000).toISOString(), now)).toBe('5m ago');
    expect(timeAgo(new Date(now - 3 * 3600 * 1000).toISOString(), now)).toBe('3h ago');
    expect(timeAgo(new Date(now - 2 * 86400 * 1000).toISOString(), now)).toBe('2d ago');
  });

  it('falls back to an absolute date past a week', () => {
    const out = timeAgo(new Date(now - 10 * 86400 * 1000).toISOString(), now);
    expect(out).not.toMatch(/ago|Just now/);
    expect(out.length).toBeGreaterThan(0);
  });
});

describe('rowToHang', () => {
  const now = 1_000_000_000_000;
  const row: HangRow = {
    id: 'h1',
    spot_id: 'rooftop',
    title: 'Sunset session',
    note: 'great light',
    image: 'h.jpg',
    extra_attendees: 2,
    attendees: [{ id: 'marcus', name: 'Marcus', initial: 'M' }],
    created_at: new Date(now).toISOString(),
    author: { id: 'uuid-1', name: 'Sam Fox', initial: 'S' },
  };

  it('maps a hang row (with author + attendees snapshot) to the domain shape', () => {
    expect(rowToHang(row, now)).toEqual({
      id: 'h1',
      spotId: 'rooftop',
      author: { id: 'uuid-1', name: 'Sam Fox', initial: 'S' },
      title: 'Sunset session',
      note: 'great light',
      image: 'h.jpg',
      when: 'Just now',
      attendees: [{ id: 'marcus', name: 'Marcus', initial: 'M' }],
      extraAttendees: 2,
      likes: 0,
    });
  });

  it('defaults a null note and missing attendees', () => {
    const hang = rowToHang({ ...row, note: null, attendees: null }, now);
    expect(hang.note).toBe('');
    expect(hang.attendees).toEqual([]);
  });

  it('falls back to an Unknown author when the profile join is null', () => {
    const hang = rowToHang({ ...row, author: null }, now);
    expect(hang.author).toEqual({ id: '', name: 'Unknown', initial: '?' });
  });
});
