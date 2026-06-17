import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { makeHang } from '@/test-utils/factories';
import { HangCard } from '../HangCard';

jest.mock('expo-image', () => ({ Image: 'Image' }));

/** Read the numeric count shown inside a reaction button (0 when none is shown). */
function reactionCount(label: string): number {
  const btn = screen.getByLabelText(label);
  const text = within(btn).queryByText(/^\d+$/);
  return text ? Number(text.props.children) : 0;
}

describe('HangCard reactions', () => {
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
