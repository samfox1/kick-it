import type { Member } from '../../domain/models';

/** The mock-mode identity (used when not on Supabase; Supabase hydrates the real auth user). */
export const CURRENT_MEMBER: Member = { id: 'sam', name: 'Sam Fox', initial: 'S' };

/** The single mock user (no auth yet) — the member plus profile-only fields. */
export const CURRENT_USER = { ...CURRENT_MEMBER, handle: '@samkicks' };

/** The user's crew (accepted members). */
export const CREW: Member[] = [
  { id: 'marcus', name: 'Marcus', initial: 'M' },
  { id: 'sara', name: 'Sara', initial: 'S' },
  { id: 'dev', name: 'Dev', initial: 'D' },
  { id: 'nia', name: 'Nia', initial: 'N' },
  { id: 'joey', name: 'Joey', initial: 'J' },
];

/** People who've asked to join your crew — you accept or deny each. */
export const CREW_REQUESTS: Member[] = [
  { id: 'tess', name: 'Tess', initial: 'T' },
  { id: 'rick', name: 'Rick', initial: 'R' },
  { id: 'priya', name: 'Priya', initial: 'P' },
];

/** Ids whose private (friends/invite) posts you can see: your crew + you.
 *  `selfId` is the current identity (the hydrated auth user, not a hardcoded mock id). */
export const crewFriendIds = (selfId: string, members: Member[]): string[] => [
  selfId,
  ...members.map((m) => m.id),
];
