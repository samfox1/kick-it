import { getCharacteristic } from './characteristics';
import type { CategoryKey, Characteristic } from './models';

const ORDER: CategoryKey[] = ['outdoors', 'vibe', 'features', 'access'];

export interface CategoryGroup {
  category: CategoryKey;
  items: Characteristic[];
}

/**
 * Groups characteristic ids into category buckets in canonical order
 * (Outdoors → Vibe → Features → Access). Unknown ids are skipped; empty
 * categories are omitted.
 */
export function groupByCategory(ids: string[]): CategoryGroup[] {
  const resolved = ids
    .map((id) => getCharacteristic(id))
    .filter((c): c is Characteristic => c !== undefined);

  return ORDER.map((category) => ({
    category,
    items: resolved.filter((c) => c.category === category),
  })).filter((g) => g.items.length > 0);
}
