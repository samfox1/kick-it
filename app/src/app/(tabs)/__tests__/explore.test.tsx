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
  it('has a big Public/Crew toggle and shows nearby public spots once location is granted', async () => {
    renderScreen();
    expect(screen.getByText('Public')).toBeOnTheScreen();
    expect(screen.getByText('Crew')).toBeOnTheScreen();
    // Cedar Bench is open + 0.4 mi → within the default 5 mi limit.
    expect(await screen.findByText('Cedar Bench by the Oak')).toBeOnTheScreen();
  });

  it("switches to the crew's friends-only spots", async () => {
    renderScreen();
    await screen.findByText('Cedar Bench by the Oak');
    fireEvent.press(screen.getByText('Crew'));
    // Joey's Basement is friends-only → only visible on the Crew tab.
    expect(await screen.findByText("Joey's Basement")).toBeOnTheScreen();
  });
});
