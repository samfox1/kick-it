/** The kinds of things worth pinging a Kick It user about. */
export type NotificationKind =
  | 'new_spot' // a friend posted a spot near you
  | 'hang' // someone logged a hang at a spot you ranked/saved
  | 'endorse' // someone vouched for a characteristic on your spot
  | 'crew' // a friend joined your crew / accepted an invite
  | 'like' // someone liked your hang story
  | 'rank'; // a friend ranked your spot (or it hit their #1)

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actorInitial: string;
  text: string;
  when: string;
  /** Spot to open when tapped, if relevant. */
  spotId?: string;
  unread: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'new_spot',
    actorInitial: 'M',
    text: 'Marcus added a new spot near you — Marcus’s Rooftop',
    when: '2h ago',
    spotId: 'rooftop',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'like',
    actorInitial: 'S',
    text: 'Sara and 4 others liked your hang “Golden hour burgers”',
    when: '5h ago',
    spotId: 'pontoon',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'endorse',
    actorInitial: 'D',
    text: 'Dev vouched for “Aux access” at Joey’s Basement',
    when: 'Yesterday',
    spotId: 'basement',
    unread: true,
  },
  {
    id: 'n4',
    kind: 'hang',
    actorInitial: 'N',
    text: 'Nia logged a hang at a spot you ranked — Nia’s Firepit',
    when: 'Yesterday',
    spotId: 'firepit',
    unread: false,
  },
  {
    id: 'n5',
    kind: 'rank',
    actorInitial: 'J',
    text: 'Joey ranked Uncle Rick’s Pontoon #1 on their list',
    when: '2d ago',
    spotId: 'pontoon',
    unread: false,
  },
  {
    id: 'n6',
    kind: 'crew',
    actorInitial: 'T',
    text: 'Tess joined your crew',
    when: '3d ago',
    unread: false,
  },
];
