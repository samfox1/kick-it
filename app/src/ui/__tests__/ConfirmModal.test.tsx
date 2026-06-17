import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  const setup = (over: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ConfirmModal
        visible
        title="Delete hang?"
        message="“Sunset session” will be removed."
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...over}
      />,
    );
    return { onConfirm, onCancel };
  };

  it('renders the title, message, and default labels when visible', () => {
    setup();
    expect(screen.getByText('Delete hang?')).toBeOnTheScreen();
    expect(screen.getByText('“Sunset session” will be removed.')).toBeOnTheScreen();
    expect(screen.getByText('Delete')).toBeOnTheScreen();
    expect(screen.getByText('Cancel')).toBeOnTheScreen();
  });

  it('fires onConfirm (and not onCancel) when the confirm button is pressed', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.press(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('fires onCancel when the cancel button is pressed', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('fires onCancel when the backdrop is pressed', () => {
    const { onCancel } = setup();
    fireEvent.press(screen.getByTestId('confirmBackdrop'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does NOT dismiss when the card body is pressed (guards accidental deletes)', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.press(screen.getByTestId('confirmCard'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders nothing when not visible', () => {
    setup({ visible: false });
    expect(screen.queryByText('Delete hang?')).not.toBeOnTheScreen();
  });
});
