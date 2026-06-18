import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import EditProfileScreen from '../edit-profile';
import { useProfileStore } from '@/store/profileStore';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <EditProfileScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockBack.mockClear();
  useProfileStore.setState({
    member: { id: 'sam', name: 'Sam Fox', initial: 'S' },
    handle: '@samkicks',
  });
});

describe('Edit profile screen', () => {
  it('saves the name and handle to the profile store', () => {
    renderScreen();
    fireEvent.changeText(screen.getByDisplayValue('Sam Fox'), 'Renamed Sam');
    fireEvent.changeText(screen.getByDisplayValue('@samkicks'), '@renamed');
    fireEvent.press(screen.getByText('Save'));

    expect(useProfileStore.getState().member.name).toBe('Renamed Sam');
    expect(useProfileStore.getState().member.initial).toBe('R');
    expect(useProfileStore.getState().handle).toBe('@renamed');
    expect(mockBack).toHaveBeenCalled();
  });

  it('keeps the previous name when the field is blanked', () => {
    renderScreen();
    fireEvent.changeText(screen.getByDisplayValue('Sam Fox'), '   ');
    fireEvent.press(screen.getByText('Save'));
    expect(useProfileStore.getState().member.name).toBe('Sam Fox');
  });
});
