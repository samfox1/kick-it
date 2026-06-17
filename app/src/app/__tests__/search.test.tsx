import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SearchScreen from '../search';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SearchScreen />
    </SafeAreaProvider>,
  );
}

describe('Search screen', () => {
  it('shows a prompt until you type, then matching spots', async () => {
    renderScreen();
    expect(screen.getByText(/Find a spot/)).toBeOnTheScreen();
    fireEvent.changeText(screen.getByPlaceholderText(/Search spots/), 'rooftop');
    expect(await screen.findByText("Marcus's Rooftop")).toBeOnTheScreen();
  });
});
