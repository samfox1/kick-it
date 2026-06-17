import { create } from 'zustand';

import { createDefaultFeedRepository } from '@/data/mock/feedSeed';
import { HANGS } from '@/data/mock/hangSeed';
import { crewFriendIds } from '@/data/mock/profile';
import type { FeedRepository } from '@/data/FeedRepository';
import { visibleFeed } from '@/domain/feedView';
import type { FeedItem } from '@/domain/models';
import { hangCountForSpot, saveCountForSpot } from '@/domain/spotStats';
import { useCrewStore } from '@/store/crewStore';

const repo: FeedRepository = createDefaultFeedRepository();

/** Fill new-spot cards with real hang counts (from the ledger) and save counts. */
function withStats(items: FeedItem[]): FeedItem[] {
  return items.map((item) =>
    item.kind === 'new_spot'
      ? {
          ...item,
          hangs: hangCountForSpot(HANGS, item.spotId),
          saved: saveCountForSpot(item.spotId),
        }
      : item,
  );
}

interface FeedState {
  items: FeedItem[];
  loaded: boolean;
  /** Set when the last load failed, so the UI can show/retry. Null on success. */
  error: string | null;
  load: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  loaded: false,
  error: null,
  load: async () => {
    const res = await repo.listFeed();
    if (!res.ok) {
      set({ loaded: true, error: res.error.message });
      return;
    }
    const friendIds = crewFriendIds(useCrewStore.getState().members);
    set({ items: withStats(visibleFeed(res.value.items, friendIds)), loaded: true, error: null });
  },
}));
