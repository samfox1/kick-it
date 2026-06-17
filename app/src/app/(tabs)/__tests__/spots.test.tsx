import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SpotsScreen from '../spots';

// Native/router modules the screen pulls in — stub to host components for rendering.
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SpotsScreen />
    </SafeAreaProvider>,
  );
}

describe('Spots screen', () => {
  it('shows the title and loads only savable local spots (excludes ones already collected)', async () => {
    renderScreen();
    expect(screen.getByText('the Spots')).toBeOnTheScreen();
    // Local discovery shows spots not already in your ranked list.
    expect(await screen.findByText('The Loading Dock')).toBeOnTheScreen();
    expect(screen.getByText('Riverwalk Steps')).toBeOnTheScreen();
    // Tin Roof is already ranked (in `mine`) → not shown as a discoverable local spot.
    expect(screen.queryByText('The Tin Roof Patio')).not.toBeOnTheScreen();
  });
});
