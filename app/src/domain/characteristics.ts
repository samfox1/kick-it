import type { Characteristic } from './models';

/** The full catalog of taggable/endorsable spot characteristics, grouped by category. */
export const CHARACTERISTICS: Characteristic[] = [
  // Outdoors
  { id: 'water', label: 'On the water', category: 'outdoors' },
  { id: 'sunset', label: 'Sunset views', category: 'outdoors' },
  { id: 'view', label: 'City view', category: 'outdoors' },
  { id: 'shaded', label: 'Shaded', category: 'outdoors' },
  // Vibe
  { id: 'cannabis', label: 'Cannabis ok', category: 'vibe' },
  { id: 'loud', label: 'Loud-friendly', category: 'vibe' },
  { id: 'byob', label: 'BYOB welcome', category: 'vibe' },
  { id: 'private', label: 'Total privacy', category: 'vibe' },
  // Features
  { id: 'aux', label: 'Aux access', category: 'features' },
  { id: 'charging', label: 'Charging', category: 'features' },
  { id: 'wifi', label: 'WiFi', category: 'features' },
  { id: 'bathroom', label: 'Bathroom', category: 'features' },
  { id: 'parking', label: 'Parking', category: 'features' },
  // Access
  { id: 'free', label: 'Free', category: 'access' },
  { id: 'food', label: 'Food on site', category: 'access' },
  { id: 'biggroup', label: 'Big group ok', category: 'access' },
  { id: 'dog', label: 'Dog friendly', category: 'access' },
  { id: 'openlate', label: 'Open late', category: 'access' },
];

const BY_ID = new Map(CHARACTERISTICS.map((c) => [c.id, c]));

/** Look up a characteristic by id, or undefined if not in the catalog. */
export function getCharacteristic(id: string): Characteristic | undefined {
  return BY_ID.get(id);
}
