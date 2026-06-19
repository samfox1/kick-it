import type { AccessLevel, Spot } from '@/domain/models';

/** A `spots` table row (snake_case columns). */
export type SpotRow = {
  id: string;
  name: string;
  category: string;
  access: AccessLevel;
  location: string | null;
  lat: number | null;
  lng: number | null;
  image: string;
  images: string[] | null;
  characteristic_ids: string[] | null;
  description: string | null;
};

/**
 * Map a spots row to the Spot domain type. `score` and `distanceMi` are derived
 * elsewhere (rank position / viewer location), so they default to 0 here.
 */
export function rowToSpot(row: SpotRow): Spot {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    access: row.access,
    score: 0,
    distanceMi: 0,
    location: row.location ?? '',
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    image: row.image,
    images: row.images ?? undefined,
    characteristicIds: row.characteristic_ids ?? [],
    description: row.description ?? undefined,
  };
}
