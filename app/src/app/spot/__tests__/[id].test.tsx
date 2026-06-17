import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SpotDetailScreen from '../[id]';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'pontoon' }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Spot detail screen', () => {
  it('loads the spot, its vouch badges, and its hang ledger', async () => {
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <SpotDetailScreen />
      </SafeAreaProvider>,
    );
    expect(await screen.findByText("Uncle Rick's Pontoon")).toBeOnTheScreen();
    expect(screen.getByText('What people vouch for')).toBeOnTheScreen();
    expect(screen.getByText('On the water')).toBeOnTheScreen();
    expect(screen.getByText('Golden hour burgers')).toBeOnTheScreen();
  });
});
