import type { Member } from '../../domain/models';

/** Stable portrait avatars for mock users (pravatar serves the same face per index). */
const face = (n: number) => `https://i.pravatar.cc/240?img=${n}`;

/** The mock-mode identity (used when not on Supabase; Supabase hydrates the real auth user). */
export const CURRENT_MEMBER: Member = {
  id: 'sam',
  name: 'Sam Fox',
  initial: 'S',
  avatar: face(12),
};

/** The single mock user (no auth yet) — the member plus profile-only fields. */
export const CURRENT_USER = { ...CURRENT_MEMBER, handle: '@samkicks' };

/** The user's crew (accepted members). */
export const CREW: Member[] = [
  { id: 'marcus', name: 'Marcus Lee', initial: 'M', avatar: face(13) },
  { id: 'sara', name: 'Sara Quinn', initial: 'S', avatar: face(5) },
  { id: 'dev', name: 'Dev Patel', initial: 'D', avatar: face(33) },
  { id: 'nia', name: 'Nia Brooks', initial: 'N', avatar: face(45) },
  { id: 'joey', name: 'Joey Marsh', initial: 'J', avatar: face(53) },
];

/** People who've asked to join your crew — you accept or deny each. */
export const CREW_REQUESTS: Member[] = [
  { id: 'tess', name: 'Tess Romano', initial: 'T', avatar: face(47) },
  { id: 'rick', name: 'Rick Alvarez', initial: 'R', avatar: face(15) },
  { id: 'priya', name: 'Priya Shah', initial: 'P', avatar: face(44) },
];

/** Ids whose private (friends/invite) posts you can see: your crew + you.
 *  `selfId` is the current identity (the hydrated auth user, not a hardcoded mock id). */
export const crewFriendIds = (selfId: string, members: Member[]): string[] => [
  selfId,
  ...members.map((m) => m.id),
];
