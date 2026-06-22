import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ExploreScreen from '../explore';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted' },
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest
    .fn()
    .mockResolvedValue({ coords: { latitude: 43.07, longitude: -89.4 } }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ExploreScreen />
    </SafeAreaProvider>,
  );
}

describe('Explore screen', () => {
  it('has a big Public/Crew toggle and shows nearby public spots you have not collected', async () => {
    renderScreen();
    expect(screen.getByText('Public')).toBeOnTheScreen();
    expect(screen.getByText('Crew')).toBeOnTheScreen();
    // Riverwalk Steps is open + 1.6 mi and not already in your list.
    expect(await screen.findByText('Riverwalk Steps')).toBeOnTheScreen();
    // Cedar Bench is open + nearby but already ranked → not shown in discovery.
    expect(screen.queryByText('Cedar Bench by the Oak')).not.toBeOnTheScreen();
  });

  it("switches to the crew's invite/friends-only spots", async () => {
    renderScreen();
    await screen.findByText('Riverwalk Steps');
    fireEvent.press(screen.getByText('Crew'));
    // The Loading Dock is invite-only and not yet collected → shown on the Crew tab.
    expect(await screen.findByText('The Loading Dock')).toBeOnTheScreen();
  });
});
