import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AddScreen from '../add';

let mockParams: Record<string, string> = {};

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted' },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AddScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockParams = {};
});

describe('Add screen (new spot)', () => {
  it('opens on the photo + name + category step', () => {
    renderScreen();
    expect(screen.getByText('Add a spot')).toBeOnTheScreen();
    expect(screen.getByText('Add photos')).toBeOnTheScreen();
    expect(screen.getByText('Category')).toBeOnTheScreen();
    expect(screen.getByText('Step 1 of 5')).toBeOnTheScreen();
  });

  it('advances through the steps to access', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Continue'));
    expect(screen.getByText('Who can find this spot?')).toBeOnTheScreen();
    expect(screen.getByText('Step 2 of 5')).toBeOnTheScreen();
  });
});

describe('Add screen (duplicate detection)', () => {
  it('flags possible duplicates once you pin a location near existing spots', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByPlaceholderText("Nia's Firepit"), 'Cedar Bench');
    fireEvent.press(screen.getByText(/Pin this spot/));
    expect(await screen.findByText('Is it one of these?')).toBeOnTheScreen();
    // Cedar Bench sits ~44m from the demo location → surfaced as a possible duplicate.
    expect(screen.getByText('Cedar Bench by the Oak')).toBeOnTheScreen();
  });
});

describe('Add screen (logging a hang at an existing spot)', () => {
  it("auto-enters the spot's fixed details and skips re-typing them", async () => {
    mockParams = { spotId: 'rooftop' };
    renderScreen();

    // Header reframes as logging a hang, not adding a spot.
    expect(screen.getByText('Log a hang')).toBeOnTheScreen();
    expect(screen.getByText('Step 1 of 2')).toBeOnTheScreen();

    // The spot's fixed details come along automatically (no re-entry).
    expect(await screen.findByText("Marcus's Rooftop")).toBeOnTheScreen();
    expect(screen.getByText('Eastside · rooftop')).toBeOnTheScreen();

    // You do NOT re-type the spot's name.
    expect(screen.queryByText("What's it called?")).not.toBeOnTheScreen();
  });
});
