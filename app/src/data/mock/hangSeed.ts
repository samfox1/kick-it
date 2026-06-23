import type { Hang, Member } from '../../domain/models';
import { MockHangRepository } from '../MockHangRepository';
import type { HangRepository } from '../HangRepository';
import { CREW, CREW_REQUESTS, CURRENT_MEMBER } from './profile';

const photo = (keywords: string, lock: number) =>
  `https://loremflickr.com/600/400/${keywords}?lock=${lock}`;
const face = (n: number) => `https://i.pravatar.cc/240?img=${n}`;

// Reuse the avatar'd crew + requests so members look the same everywhere.
const [marcus, sara, dev, nia, joey] = CREW;
const [tess, rick] = CREW_REQUESTS;
const me: Member = CURRENT_MEMBER;
// A wider cast so attendee lists are fully named (no anonymous "+N"); several are
// outside your crew, so the invite path is exercised.
const leo: Member = { id: 'leo', name: 'Leo Park', initial: 'L', avatar: face(60) };
const mia: Member = { id: 'mia', name: 'Mia Cole', initial: 'M', avatar: face(20) };
const theo: Member = { id: 'theo', name: 'Theo Nash', initial: 'T', avatar: face(11) };
const gabe: Member = { id: 'gabe', name: 'Gabe Ruiz', initial: 'G', avatar: face(8) };
const omar: Member = { id: 'omar', name: 'Omar Diaz', initial: 'O', avatar: face(59) };
const ivy: Member = { id: 'ivy', name: 'Ivy Chen', initial: 'I', avatar: face(24) };
const cass: Member = { id: 'cass', name: 'Cass Webb', initial: 'C', avatar: face(31) };
const pia: Member = { id: 'pia', name: 'Pia Romano', initial: 'P', avatar: face(48) };
const ben: Member = { id: 'ben', name: 'Ben Hill', initial: 'B', avatar: face(7) };

const HANGS: Hang[] = [
  {
    id: 'h1',
    spotId: 'pontoon',
    author: marcus,
    title: 'Golden hour burgers',
    note: 'Nine of us, Rick on the grill, Dev on aux. Best one yet.',
    image: photo('lake,grill,bbq', 201),
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
    image: photo('lake,boat,party', 202),
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
    image: photo('gaming,console', 203),
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
    image: photo('rooftop,city,couch', 204),
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
    image: photo('rooftop,lights,night', 205),
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
    image: photo('campfire,smores', 206),
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
    image: photo('bar,patio,night', 207),
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
    image: photo('park,bench,sunset', 208),
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
    image: photo('lake,swim', 209),
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
    image: photo('city,skyline,night', 210),
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
