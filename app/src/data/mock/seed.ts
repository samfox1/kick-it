import type { Spot } from '../../domain/models';
import { MockSpotRepository, type SpotSeed } from '../MockSpotRepository';
import type { SpotRepository } from '../SpotRepository';

/** Mock photo from Lorem Picsum (real Unsplash-licensed images — free for public/commercial
 *  use). `id` picks a stable photo; `keywords` is just a label for what we're aiming at. */
const photo = (keywords: string, id: number) => `https://picsum.photos/id/${id}/600/400`;

/** Spots the current user has saved/ranked (their crew's map). */
const mine: Spot[] = [
  {
    id: 'pontoon',
    name: "Uncle Rick's Pontoon",
    category: 'on water',
    access: 'invite',
    score: 9.6,
    distanceMi: 8,
    location: 'Lake Mendota',
    lat: 43.1097,
    lng: -89.4206,
    image: photo('lake,pontoon,boat', 101),
    images: [
      photo('lake,pontoon,boat', 101),
      photo('lake,dock', 102),
      photo('lake,sunset', 103),
      photo('cooler,beer', 104),
    ],
    description:
      "Rick's 24-footer. Pull out past the point, cut the engine, and the bay is yours. Bring a cooler — the fridge is small. Cell service drops near the island (feature, not a bug).",
    characteristicIds: [
      'water',
      'sunset',
      'private',
      'cannabis',
      'loud',
      'aux',
      'byob',
      'free',
      'biggroup',
    ],
  },
  {
    id: 'basement',
    name: "Joey's Basement",
    category: 'basement',
    access: 'friends',
    score: 9.2,
    distanceMi: 2,
    location: 'Near campus',
    lat: 43.0733,
    lng: -89.4009,
    image: photo('basement,game,room', 110),
    images: [
      photo('basement,game,room', 110),
      photo('couch,living,room', 111),
      photo('tv,console,gaming', 112),
    ],
    characteristicIds: ['aux', 'charging', 'private', 'cannabis'],
  },
  {
    id: 'rooftop',
    name: "Marcus's Rooftop",
    category: 'rooftop',
    access: 'friends',
    score: 8.9,
    distanceMi: 3,
    location: 'Eastside',
    lat: 43.0738,
    lng: -89.4015,
    image: photo('rooftop,city,terrace', 120),
    images: [
      photo('rooftop,city,terrace', 120),
      photo('city,skyline', 121),
      photo('rooftop,night,lights', 122),
      photo('rooftop,lounge', 123),
    ],
    characteristicIds: ['charging', 'cannabis', 'view', 'aux'],
  },
  {
    id: 'firepit',
    name: "Nia's Firepit",
    category: 'backyard',
    access: 'friends',
    score: 8.7,
    distanceMi: 4,
    location: 'Northside',
    lat: 43.076,
    lng: -89.403,
    image: photo('firepit,backyard,bonfire', 130),
    characteristicIds: ['loud', 'biggroup', 'dog'],
  },
  {
    id: 'tinroof',
    name: 'The Tin Roof Patio',
    category: 'bar patio',
    access: 'open',
    score: 8.4,
    distanceMi: 1.1,
    location: 'Downtown',
    lat: 43.0731,
    lng: -89.4002,
    image: photo('bar,patio', 140),
    characteristicIds: ['food', 'aux', 'shaded', 'parking'],
  },
  {
    id: 'cedar',
    name: 'Cedar Bench by the Oak',
    category: 'park',
    access: 'open',
    score: 7.8,
    distanceMi: 0.4,
    location: 'Cedar Park',
    lat: 43.0735,
    lng: -89.4012,
    image: photo('park,bench,trees', 150),
    characteristicIds: ['sunset', 'free', 'shaded'],
  },
];

/** Public + nearby spots to discover. */
const local: Spot[] = [
  {
    id: 'cedar',
    name: 'Cedar Bench by the Oak',
    category: 'park',
    access: 'open',
    score: 7.8,
    distanceMi: 0.4,
    location: 'Cedar Park',
    lat: 43.0735,
    lng: -89.4012,
    image: photo('park,bench,trees', 150),
    characteristicIds: ['sunset', 'free', 'shaded'],
  },
  {
    id: 'tinroof',
    name: 'The Tin Roof Patio',
    category: 'bar patio',
    access: 'open',
    score: 8.4,
    distanceMi: 1.1,
    location: 'Downtown',
    lat: 43.0731,
    lng: -89.4002,
    image: photo('bar,patio', 140),
    images: [photo('bar,patio', 140), photo('bar,counter', 141), photo('bar,night', 142)],
    characteristicIds: ['food', 'aux', 'shaded', 'parking'],
  },
  {
    id: 'dock',
    name: 'The Loading Dock',
    category: 'lot',
    access: 'invite',
    score: 6.2,
    distanceMi: 2.3,
    location: 'Warehouse district',
    lat: 43.0728,
    lng: -89.402,
    image: photo('warehouse,loft', 160),
    characteristicIds: ['loud', 'openlate', 'biggroup'],
  },
  {
    id: 'riverwalk',
    name: 'Riverwalk Steps',
    category: 'waterfront',
    access: 'open',
    score: 7.1,
    distanceMi: 1.6,
    location: 'Riverfront',
    lat: 43.0745,
    lng: -89.4012,
    image: photo('river,waterfront', 170),
    images: [photo('river,waterfront', 170), photo('river,steps', 171), photo('river,dusk', 172)],
    characteristicIds: ['water', 'free', 'sunset'],
  },
];

export const SEED: SpotSeed = { local, mine };

/** The app's default repository: an in-memory mock over the seed. */
export function createDefaultSpotRepository(): SpotRepository {
  return new MockSpotRepository(SEED);
}
