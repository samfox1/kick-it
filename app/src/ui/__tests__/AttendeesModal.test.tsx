import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Member } from '@/domain/models';
import { AttendeesModal, type AttendeeRow } from '../AttendeesModal';

const m = (id: string, name: string): Member => ({ id, name, initial: name[0] });

const rows: AttendeeRow[] = [
  { member: m('sam', 'Sam'), status: 'you' },
  { member: m('dev', 'Dev'), status: 'friend' },
  { member: m('tess', 'Tess'), status: 'invitable' },
  { member: m('rick', 'Rick'), status: 'invited' },
];

describe('AttendeesModal', () => {
  it('lists everyone with the right status labels', () => {
    render(
      <AttendeesModal
        visible
        rows={rows}
        extraCount={0}
        onInvite={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(screen.getByText('Sam')).toBeOnTheScreen();
    expect(screen.getByText('You')).toBeOnTheScreen();
    expect(screen.getByText('In your crew')).toBeOnTheScreen();
    expect(screen.getByText('Invited')).toBeOnTheScreen();
    expect(screen.getByLabelText('Invite Tess')).toBeOnTheScreen();
  });

  it('only offers Invite for invitable people', () => {
    render(
      <AttendeesModal
        visible
        rows={rows}
        extraCount={0}
        onInvite={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(screen.queryByLabelText('Invite Dev')).not.toBeOnTheScreen(); // friend
    expect(screen.queryByLabelText('Invite Sam')).not.toBeOnTheScreen(); // you
  });

  it('fires onInvite with the member when Invite is pressed', () => {
    const onInvite = jest.fn();
    render(
      <AttendeesModal visible rows={rows} extraCount={0} onInvite={onInvite} onClose={jest.fn()} />,
    );
    fireEvent.press(screen.getByLabelText('Invite Tess'));
    expect(onInvite).toHaveBeenCalledWith(expect.objectContaining({ id: 'tess' }));
  });

  it('shows a "+N more" row for anonymous extra attendees', () => {
    render(
      <AttendeesModal visible rows={[]} extraCount={3} onInvite={jest.fn()} onClose={jest.fn()} />,
    );
    expect(screen.getByText('3 more')).toBeOnTheScreen();
  });

  it('fires onClose from the Done button', () => {
    const onClose = jest.fn();
    render(
      <AttendeesModal visible rows={rows} extraCount={0} onInvite={jest.fn()} onClose={onClose} />,
    );
    fireEvent.press(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
