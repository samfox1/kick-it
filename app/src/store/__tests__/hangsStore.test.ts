import { useHangsStore, replaceScope } from '../hangsStore';
import { useFeedStore } from '../feedStore';
import { useSpotsStore } from '../spotsStore';
import type { Hang } from '@/domain/models';
import { makeSpot } from '../../test-utils/factories';

const hang = (id: string, over: Partial<Hang> = {}): Hang => ({
  id,
  spotId: 'pontoon',
  author: { id: 'sam', name: 'Sam', initial: 'S' },
  title: 'Title',
  note: 'note',
  image: 'x',
  when: 'now',
  attendees: [],
  extraAttendees: 0,
  likes: 0,
  ...over,
});

beforeEach(() => {
  useHangsStore.setState({ hangs: [hang('a'), hang('b', { spotId: 'rooftop' })], reactions: {} });
});

describe('hangsStore', () => {
  it('deletes a hang by id', () => {
    useHangsStore.getState().deleteHang('a');
    expect(useHangsStore.getState().hangs.map((h) => h.id)).toEqual(['b']);
  });

  it('updates a hang title and note', () => {
    useHangsStore.getState().updateHang('a', { title: 'New', note: 'changed' });
    const a = useHangsStore.getState().hangs.find((h) => h.id === 'a');
    expect(a?.title).toBe('New');
    expect(a?.note).toBe('changed');
  });

  it('leaves other hangs untouched on update', () => {
    useHangsStore.getState().updateHang('a', { title: 'New' });
    expect(useHangsStore.getState().hangs.find((h) => h.id === 'b')?.title).toBe('Title');
  });

  it('deleteHang on an unknown id leaves all hangs intact', () => {
    useHangsStore.getState().deleteHang('missing');
    expect(useHangsStore.getState().hangs.map((h) => h.id)).toEqual(['a', 'b']);
  });

  it('updateHang on an unknown id leaves all hangs intact', () => {
    useHangsStore.getState().updateHang('missing', { title: 'X' });
    expect(useHangsStore.getState().hangs.find((h) => h.id === 'a')?.title).toBe('Title');
  });

  it('updateHang with an empty patch keeps every field unchanged', () => {
    useHangsStore.getState().updateHang('a', {});
    const a = useHangsStore.getState().hangs.find((h) => h.id === 'a');
    expect(a).toEqual(expect.objectContaining({ id: 'a', title: 'Title', note: 'note' }));
  });
});

describe('hangsStore.logHang', () => {
  it('adds a new hang to the spot ledger', async () => {
    useHangsStore.setState({ hangs: [], reactions: {} });
    await useHangsStore.getState().logHang({
      spotId: 'pontoon',
      author: { id: 'sam', name: 'Sam', initial: 'S' },
      title: 'Sunset swim',
      note: 'water was perfect',
      image: 'x.jpg',
      attendees: [],
    });
    const hangs = useHangsStore.getState().hangs;
    expect(hangs.some((h) => h.spotId === 'pontoon' && h.title === 'Sunset swim')).toBe(true);
  });

  it('also posts the new hang to the home feed with the resolved spot name', async () => {
    useFeedStore.setState({ items: [], loaded: true, error: null });
    useHangsStore.setState({ hangs: [], reactions: {} });
    useSpotsStore.setState({
      mine: [makeSpot({ id: 'pontoon', name: "Uncle Rick's Pontoon" })],
      saved: [],
      local: [],
    });
    await useHangsStore.getState().logHang({
      spotId: 'pontoon',
      author: { id: 'sam', name: 'Sam', initial: 'S' },
      title: 'Feed me',
      note: 'n',
      image: 'x',
      attendees: [],
    });
    const item = useFeedStore
      .getState()
      .items.find((i) => i.kind === 'hang' && i.spotId === 'pontoon');
    expect(item).toBeDefined();
    expect(item?.spotName).toBe("Uncle Rick's Pontoon");
  });

  it('does not post to the feed when the hang spot is not loaded (never guesses)', async () => {
    useFeedStore.setState({ items: [], loaded: true, error: null });
    useHangsStore.setState({ hangs: [], reactions: {} });
    useSpotsStore.setState({ mine: [], saved: [], local: [] });
    await useHangsStore.getState().logHang({
      spotId: 'ghost',
      author: { id: 'sam', name: 'Sam', initial: 'S' },
      title: 'No spot',
      note: 'n',
      image: 'x',
      attendees: [],
    });
    // The hang is still logged, but no feed item is invented.
    expect(useHangsStore.getState().hangs.some((h) => h.title === 'No spot')).toBe(true);
    expect(useFeedStore.getState().items).toHaveLength(0);
  });

  it('puts the new hang at the top of the ledger with zero likes', async () => {
    useHangsStore.setState({ hangs: [hang('old')], reactions: {} });
    await useHangsStore.getState().logHang({
      spotId: 'pontoon',
      author: { id: 'sam', name: 'Sam', initial: 'S' },
      title: 'Newest',
      note: 'n',
      image: 'x',
      attendees: [],
    });
    const hangs = useHangsStore.getState().hangs;
    expect(hangs[0].title).toBe('Newest');
    expect(hangs[0].likes).toBe(0);
  });
});

describe('hangsStore reactions', () => {
  it('toggleReaction flips a reaction on and off', () => {
    useHangsStore.getState().toggleReaction('a', 'fire');
    expect(useHangsStore.getState().reactions.a?.fire).toBe(true);
    useHangsStore.getState().toggleReaction('a', 'fire');
    expect(useHangsStore.getState().reactions.a?.fire).toBe(false);
  });

  it('tracks reactions per hang and per key independently', () => {
    useHangsStore.getState().toggleReaction('a', 'heart');
    useHangsStore.getState().toggleReaction('b', 'haha');
    expect(useHangsStore.getState().reactions.a).toEqual({ heart: true });
    expect(useHangsStore.getState().reactions.b).toEqual({ haha: true });
  });

  it('clears a hang’s reactions when it is deleted', () => {
    useHangsStore.getState().toggleReaction('a', 'heart');
    useHangsStore.getState().deleteHang('a');
    expect(useHangsStore.getState().reactions.a).toBeUndefined();
  });
});

describe('replaceScope', () => {
  const mk = (id: string, over: Partial<Hang> = {}) => hang(id, over);

  it('replaces in-scope hangs with the fetched set, keeping out-of-scope ones', () => {
    const existing = [mk('a', { spotId: 'pontoon' }), mk('b', { spotId: 'rooftop' })];
    const incoming = [mk('c', { spotId: 'pontoon' })]; // fresh pontoon ledger
    const out = replaceScope(existing, incoming, (h) => h.spotId === 'pontoon');
    // 'a' (stale/deleted pontoon hang) is dropped; 'b' (other spot) kept; 'c' added.
    expect(out.map((h) => h.id)).toEqual(['c', 'b']);
  });

  it('de-dupes when a fetched hang is also already cached out of scope-mismatch', () => {
    const existing = [mk('a', { spotId: 'pontoon' })];
    const incoming = [mk('a', { spotId: 'pontoon' })];
    const out = replaceScope(existing, incoming, (h) => h.spotId === 'pontoon');
    expect(out.map((h) => h.id)).toEqual(['a']);
  });
});
