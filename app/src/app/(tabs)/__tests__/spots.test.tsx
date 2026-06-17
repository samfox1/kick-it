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
  it('shows the title and loads local spots, ranked by score', async () => {
    renderScreen();
    expect(screen.getByText('the Spots')).toBeOnTheScreen();
    // After the async load, the highest-scoring local spot (Tin Roof, 8.4) is shown.
    expect(await screen.findByText('The Tin Roof Patio')).toBeOnTheScreen();
    expect(screen.getByText('The Loading Dock')).toBeOnTheScreen();
  });
});
