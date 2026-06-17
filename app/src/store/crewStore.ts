import { create } from 'zustand';

import { CREW, CREW_REQUESTS } from '@/data/mock/profile';
import type { Member } from '@/domain/models';

/** Your single crew: accepted members plus pending join requests you accept or deny. */
interface CrewState {
  members: Member[];
  requests: Member[];
  acceptRequest: (id: string) => void;
  denyRequest: (id: string) => void;
}

export const useCrewStore = create<CrewState>((set) => ({
  members: CREW,
  requests: CREW_REQUESTS,

  acceptRequest: (id) =>
    set((s) => {
      const person = s.requests.find((r) => r.id === id);
      if (!person) return s;
      return {
        members: [...s.members, person],
        requests: s.requests.filter((r) => r.id !== id),
      };
    }),

  denyRequest: (id) => set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
}));
