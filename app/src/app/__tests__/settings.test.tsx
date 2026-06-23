import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SettingsScreen from '../settings';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

const mockShareInvite = jest.fn();
jest.mock('@/lib/invite', () => ({ shareInvite: () => mockShareInvite() }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SettingsScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockPush.mockClear();
  mockShareInvite.mockClear();
});

describe('Settings screen', () => {
  it('shows the settings groups and actions', () => {
    renderScreen();
    expect(screen.getByText('Settings')).toBeOnTheScreen();
    expect(screen.getByText('Edit profile')).toBeOnTheScreen();
    expect(screen.getByText('Share my location')).toBeOnTheScreen();
    expect(screen.getByText('Invite friends')).toBeOnTheScreen();
    expect(screen.getByText('Sign out')).toBeOnTheScreen();
  });

  it('opens the share sheet from "Invite friends"', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Invite friends'));
    expect(mockShareInvite).toHaveBeenCalledTimes(1);
  });

  it('routes to edit profile', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Edit profile'));
    expect(mockPush).toHaveBeenCalledWith('/edit-profile');
  });
});
