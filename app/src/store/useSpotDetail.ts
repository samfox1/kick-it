import { useEffect, useState } from 'react';

import { createDefaultSpotRepository } from '@/data/mock/seed';
import type { Spot } from '@/domain/models';

const spotRepo = createDefaultSpotRepository();

/**
 * Loads a spot by id from the repository (the fallback source for spots not held
 * in the store, e.g. a deep link). Callers should prefer the store's copy when it
 * has one, so in-app mutations like re-ranking are reflected — see spot/[id].tsx.
 */
export function useSpotDetail(id: string) {
  const [spot, setSpot] = useState<Spot | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await spotRepo.getById(id);
      if (alive) {
        // On failure, fall back to "not found" — the screen already handles undefined.
        setSpot(res.ok ? res.value : undefined);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return { spot, loading };
}
