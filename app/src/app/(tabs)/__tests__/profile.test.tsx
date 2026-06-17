import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfileScreen from '../profile';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Profile screen', () => {
  it('shows the user, stats, and the Saved/Hangs tabs', () => {
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ProfileScreen />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Sam Fox')).toBeOnTheScreen();
    expect(screen.getByText('Saved spots')).toBeOnTheScreen();
    expect(screen.getByText(/No saved spots yet/)).toBeOnTheScreen();
  });
});
