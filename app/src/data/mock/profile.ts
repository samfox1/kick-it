import type { Member } from '../../domain/models';

/** The single mock user as a crew Member — the one identity used everywhere (feed, hangs). */
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

/** Ids whose private (friends/invite) posts you can see: your crew + you. */
export const crewFriendIds = (members: Member[]): string[] => [
  CURRENT_USER.id,
  ...members.map((m) => m.id),
];
