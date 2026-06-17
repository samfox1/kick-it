import { fireEvent, render, screen } from '@testing-library/react-native';

import { PreferencesPanel } from '../PreferencesPanel';

// Stand-in slider that surfaces the value callbacks as fire-able events.
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, { ...props, testID: 'distanceSlider' }),
  };
});

const baseProps = {
  maxMi: 5,
  minMi: 1,
  maxLimit: 50,
  step: 1,
  ids: [],
  selected: [],
  onToggle: jest.fn(),
};

describe('PreferencesPanel distance slider', () => {
  it('ignores the spurious mount-time value event (no slide in progress)', () => {
    const onMaxDistance = jest.fn();
    render(<PreferencesPanel {...baseProps} onMaxDistance={onMaxDistance} />);

    // Slider emits onValueChange at the minimum on mount, without onSlidingStart.
    fireEvent(screen.getByTestId('distanceSlider'), 'valueChange', 1);

    expect(onMaxDistance).not.toHaveBeenCalled();
    expect(screen.getByText('5 mi')).toBeOnTheScreen();
  });

  it('tracks the label while dragging but only commits on release', () => {
    const onMaxDistance = jest.fn();
    render(<PreferencesPanel {...baseProps} onMaxDistance={onMaxDistance} />);
    const slider = screen.getByTestId('distanceSlider');

    fireEvent(slider, 'slidingStart', 5);
    fireEvent(slider, 'valueChange', 12);
    expect(screen.getByText('12 mi')).toBeOnTheScreen();
    expect(onMaxDistance).not.toHaveBeenCalled();

    fireEvent(slider, 'slidingComplete', 12);
    expect(onMaxDistance).toHaveBeenCalledTimes(1);
    expect(onMaxDistance).toHaveBeenCalledWith(12);
  });

  it('follows the maxMi prop when it changes externally', () => {
    const onMaxDistance = jest.fn();
    const { rerender } = render(
      <PreferencesPanel {...baseProps} maxMi={5} onMaxDistance={onMaxDistance} />,
    );
    expect(screen.getByText('5 mi')).toBeOnTheScreen();

    rerender(<PreferencesPanel {...baseProps} maxMi={20} onMaxDistance={onMaxDistance} />);
    expect(screen.getByText('20 mi')).toBeOnTheScreen();
  });

  it('hides the distance slider when showDistance is false', () => {
    render(<PreferencesPanel {...baseProps} showDistance={false} onMaxDistance={jest.fn()} />);
    expect(screen.queryByTestId('distanceSlider')).not.toBeOnTheScreen();
  });
});
