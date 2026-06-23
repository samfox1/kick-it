import type { AccessLevel, Hang, Member, Spot } from '@/domain/models';

/** Format a timestamp as a short relative string for `Hang.when`. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const secs = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** A `hangs` table row (snake_case) with the author profile embedded. */
export type HangRow = {
  id: string;
  spot_id: string;
  title: string;
  note: string | null;
  image: string;
  extra_attendees: number;
  attendees: Member[] | null;
  created_at: string;
  author: Member | null;
};

/** Map a hangs row to the Hang domain type. `likes` is 0 until reactions are persisted. */
export function rowToHang(row: HangRow, now?: number): Hang {
  return {
    id: row.id,
    spotId: row.spot_id,
    author: row.author ?? { id: '', name: 'Unknown', initial: '?' },
    title: row.title,
    note: row.note ?? '',
    image: row.image,
    when: timeAgo(row.created_at, now),
    attendees: row.attendees ?? [],
    extraAttendees: row.extra_attendees,
    likes: 0,
  };
}

/** A `spots` table row (snake_case columns). */
export type SpotRow = {
  id: string;
  creator_id: string | null;
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
    creatorId: row.creator_id ?? undefined,
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
