import { create } from 'zustand';

import { createDefaultFeedRepository } from '@/data/mock/feedSeed';
import { HANGS } from '@/data/mock/hangSeed';
import { crewFriendIds } from '@/data/mock/profile';
import { mockSaveCount } from '@/data/mock/stats';
import type { FeedRepository } from '@/data/FeedRepository';
import { visibleFeed } from '@/domain/feedView';
import type { FeedItem } from '@/domain/models';
import { hangCountForSpot } from '@/domain/spotStats';
import { useCrewStore } from '@/store/crewStore';
import { useProfileStore } from '@/store/profileStore';

const repo: FeedRepository = createDefaultFeedRepository();

/** Fill new-spot cards with real hang counts (from the ledger) and save counts. */
function withStats(items: FeedItem[]): FeedItem[] {
  return items.map((item) =>
    item.kind === 'new_spot'
      ? {
          ...item,
          hangs: hangCountForSpot(HANGS, item.spotId),
          saved: mockSaveCount(item.spotId),
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
  /** Prepend a new activity item (built by the domain feed mappers) to the top. */
  prepend: (item: FeedItem) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  loaded: false,
  error: null,
  prepend: (item) => set((s) => ({ items: [item, ...s.items] })),
  load: async () => {
    const res = await repo.listFeed();
    if (!res.ok) {
      set({ loaded: true, error: res.error.message });
      return;
    }
    const friendIds = crewFriendIds(
      useProfileStore.getState().member.id,
      useCrewStore.getState().members,
    );
    set({ items: withStats(visibleFeed(res.value.items, friendIds)), loaded: true, error: null });
  },
}));
