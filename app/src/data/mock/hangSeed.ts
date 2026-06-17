import type { Hang, Member } from '../../domain/models';
import { MockHangRepository } from '../MockHangRepository';
import type { HangRepository } from '../HangRepository';
import { CURRENT_MEMBER } from './profile';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/300/200`;

const sara: Member = { id: 'sara', name: 'Sara', initial: 'S' };
const marcus: Member = { id: 'marcus', name: 'Marcus', initial: 'M' };
const dev: Member = { id: 'dev', name: 'Dev', initial: 'D' };
const rick: Member = { id: 'rick', name: 'Rick', initial: 'R' };
const tess: Member = { id: 'tess', name: 'Tess', initial: 'T' };
const nia: Member = { id: 'nia', name: 'Nia', initial: 'N' };
const joey: Member = { id: 'joey', name: 'Joey', initial: 'J' };
const me: Member = CURRENT_MEMBER;
// A wider cast so attendee lists are fully named (no anonymous "+N"); several are
// outside your crew, so the invite path is exercised.
const leo: Member = { id: 'leo', name: 'Leo', initial: 'L' };
const mia: Member = { id: 'mia', name: 'Mia', initial: 'M' };
const theo: Member = { id: 'theo', name: 'Theo', initial: 'T' };
const gabe: Member = { id: 'gabe', name: 'Gabe', initial: 'G' };
const omar: Member = { id: 'omar', name: 'Omar', initial: 'O' };
const ivy: Member = { id: 'ivy', name: 'Ivy', initial: 'I' };
const cass: Member = { id: 'cass', name: 'Cass', initial: 'C' };
const pia: Member = { id: 'pia', name: 'Pia', initial: 'P' };
const ben: Member = { id: 'ben', name: 'Ben', initial: 'B' };

const HANGS: Hang[] = [
  {
    id: 'h1',
    spotId: 'pontoon',
    author: marcus,
    title: 'Golden hour burgers',
    note: 'Nine of us, Rick on the grill, Dev on aux. Best one yet.',
    image: img('hang1'),
    when: 'Jun 9',
    attendees: [sara, marcus, dev, rick, nia, joey, leo, mia, theo],
    extraAttendees: 0,
    likes: 18,
  },
  {
    id: 'h2',
    spotId: 'pontoon',
    author: tess,
    title: "Tess's birthday float",
    note: 'Tied two boats together. Cake survived. Barely.',
    image: img('hang2'),
    when: 'May 24',
    attendees: [tess, rick, dev],
    extraAttendees: 0,
    likes: 24,
  },
  {
    id: 'h3',
    spotId: 'basement',
    author: joey,
    title: 'Smash tournament',
    note: 'Joey defended his title. Barely.',
    image: img('hang3'),
    when: 'May 2',
    attendees: [marcus, dev, joey, leo, gabe],
    extraAttendees: 0,
    likes: 12,
  },
  {
    id: 'h4',
    spotId: 'rooftop',
    author: marcus,
    title: 'Couch up the fire escape',
    note: 'Dragged the old couch up five flights. Worth every step for that skyline.',
    image: img('hang4'),
    when: 'Jun 12',
    attendees: [marcus, sara, dev, nia, omar],
    extraAttendees: 0,
    likes: 21,
  },
  {
    id: 'h5',
    spotId: 'rooftop',
    author: sara,
    title: 'String lights & vinyl',
    note: 'Strung up lights, Sara brought the record player. Stayed til the trains stopped.',
    image: img('hang5'),
    when: 'May 30',
    attendees: [marcus, nia, sara, joey, ivy, cass],
    extraAttendees: 0,
    likes: 16,
  },
  {
    id: 'h6',
    spotId: 'firepit',
    author: nia,
    title: "S'mores & a slackline",
    note: 'Nia rigged a slackline between the oaks. Nobody made it across sober.',
    image: img('hang6'),
    when: 'Jun 7',
    attendees: [nia, joey, dev, marcus, leo, pia],
    extraAttendees: 0,
    likes: 14,
  },
  {
    id: 'h7',
    spotId: 'tinroof',
    author: sara,
    title: 'Trivia night patio',
    note: 'Took second place. The aux was ours all night.',
    image: img('hang7'),
    when: 'Jun 4',
    attendees: [sara, joey, dev, nia, ben, mia, theo],
    extraAttendees: 0,
    likes: 9,
  },
  {
    id: 'h8',
    spotId: 'cedar',
    author: dev,
    title: 'Sunset on the bench',
    note: 'Quiet one. Coffee, the oak, and the light going gold.',
    image: img('hang8'),
    when: 'May 18',
    attendees: [dev, tess],
    extraAttendees: 0,
    likes: 7,
  },
  {
    id: 'h9',
    spotId: 'pontoon',
    author: me,
    title: 'Sundown swim off the back',
    note: 'Cut the engine past the point and jumped in. Water was perfect.',
    image: img('hang9'),
    when: 'Jun 11',
    attendees: [me, sara, joey, marcus],
    extraAttendees: 0,
    likes: 11,
  },
  {
    id: 'h10',
    spotId: 'rooftop',
    author: me,
    title: 'Late-night skyline',
    note: 'Brought the speaker up, watched the city do its thing til 2am.',
    image: img('hang10'),
    when: 'May 28',
    attendees: [me, dev],
    extraAttendees: 0,
    likes: 6,
  },
];

export function createDefaultHangRepository(): HangRepository {
  return new MockHangRepository(HANGS);
}

export { HANGS };
