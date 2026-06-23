import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { makeHang } from '@/test-utils/factories';
import { useCrewStore } from '@/store/crewStore';
import { useHangsStore } from '@/store/hangsStore';
import { useProfileStore } from '@/store/profileStore';
import { HangCard } from '../HangCard';

jest.mock('expo-image', () => ({ Image: 'Image' }));

/** Read the numeric count shown inside a reaction button (0 when none is shown). */
function reactionCount(label: string): number {
  const btn = screen.getByLabelText(label);
  const text = within(btn).queryByText(/^\d+$/);
  return text ? Number(text.props.children) : 0;
}

describe('HangCard reactions', () => {
  beforeEach(() => {
    useHangsStore.setState({ reactions: {} });
    useCrewStore.setState({ invited: [] });
    useProfileStore.setState({
      member: { id: 'sam', name: 'Sam Fox', initial: 'S' },
      handle: '@samkicks',
    });
  });

  it('shows the heart count from hang.likes and toggles it by one', () => {
    render(<HangCard hang={makeHang({ likes: 3 })} />);
    expect(reactionCount('React heart')).toBe(3);

    fireEvent.press(screen.getByLabelText('React heart'));
    expect(reactionCount('React heart')).toBe(4);

    fireEvent.press(screen.getByLabelText('React heart'));
    expect(reactionCount('React heart')).toBe(3);
  });

  it('increments a non-heart reaction by exactly one when tapped', () => {
    render(<HangCard hang={makeHang({ id: 'hang-xyz' })} />);
    const before = reactionCount('React fire');
    fireEvent.press(screen.getByLabelText('React fire'));
    expect(reactionCount('React fire')).toBe(before + 1);
  });

  it('derives non-heart base counts deterministically from the hang id', () => {
    const { unmount } = render(<HangCard hang={makeHang({ id: 'stable-id' })} />);
    const first = reactionCount('React haha');
    unmount();
    render(<HangCard hang={makeHang({ id: 'stable-id' })} />);
    expect(reactionCount('React haha')).toBe(first);
  });

  it('persists a reaction across unmount (state lives in the store)', () => {
    const hang = makeHang({ id: 'persist-me', likes: 2 });
    const { unmount } = render(<HangCard hang={hang} />);
    fireEvent.press(screen.getByLabelText('React heart'));
    expect(reactionCount('React heart')).toBe(3);
    unmount();

    render(<HangCard hang={hang} />);
    expect(reactionCount('React heart')).toBe(3); // still on after remount
  });

  it('shows your live profile name on your own hangs (a rename updates them)', () => {
    useProfileStore.setState({
      member: { id: 'sam', name: 'Renamed Sam', initial: 'R' },
      handle: '@samkicks',
    });
    render(<HangCard hang={makeHang({ author: { id: 'sam', name: 'Old Name', initial: 'O' } })} />);
    expect(screen.getByText('Renamed Sam')).toBeOnTheScreen();
    expect(screen.queryByText('Old Name')).not.toBeOnTheScreen();
  });

  it("leaves other people's hang author names alone", () => {
    render(
      <HangCard hang={makeHang({ author: { id: 'marcus', name: 'Marcus', initial: 'M' } })} />,
    );
    expect(screen.getByText('Marcus')).toBeOnTheScreen();
  });

  it('collapses the avatar stack to "+N" past the visible cap', () => {
    const attendees = Array.from({ length: 7 }, (_, i) => ({
      id: `p${i}`,
      name: `P${i}`,
      initial: 'P',
    }));
    render(<HangCard hang={makeHang({ attendees, extraAttendees: 0 })} />);
    // 5 faces shown + a "+2" overflow badge (7 people − 5 faces).
    expect(screen.getByText('+2')).toBeOnTheScreen();
  });

  it('shows an @spot link and fires onPressSpot when tapped', () => {
    const onPressSpot = jest.fn();
    render(
      <HangCard hang={makeHang()} spotName="Uncle Rick's Pontoon" onPressSpot={onPressSpot} />,
    );
    fireEvent.press(screen.getByText("@Uncle Rick's Pontoon"));
    expect(onPressSpot).toHaveBeenCalledTimes(1);
  });

  it('omits the @spot line when no spotName is given', () => {
    render(<HangCard hang={makeHang()} />);
    expect(screen.queryByLabelText(/^At /)).not.toBeOnTheScreen();
  });

  it('opens the attendees modal, offers Invite for a non-crew attendee, and records it', () => {
    const hang = makeHang({
      attendees: [{ id: 'tess', name: 'Tess', initial: 'T' }], // not in the seeded crew
    });
    render(<HangCard hang={hang} />);
    fireEvent.press(screen.getByLabelText('See who was there'));
    expect(screen.getByText('Who was there')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText('Invite Tess'));
    expect(useCrewStore.getState().invited).toContain('tess');
    expect(screen.getByText('Invited')).toBeOnTheScreen();
  });

  it('shows edit/delete controls only when handlers are provided', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { rerender } = render(<HangCard hang={makeHang()} />);
    expect(screen.queryByLabelText('Edit hang')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Delete hang')).not.toBeOnTheScreen();

    rerender(<HangCard hang={makeHang()} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.press(screen.getByLabelText('Edit hang'));
    fireEvent.press(screen.getByLabelText('Delete hang'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
