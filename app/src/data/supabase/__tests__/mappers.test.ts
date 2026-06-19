import { rowToSpot, type SpotRow } from '../mappers';

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
