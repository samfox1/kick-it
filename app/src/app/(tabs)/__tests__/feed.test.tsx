import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import FeedScreen from '../feed';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Feed screen', () => {
  it('renders the activity feed (new spot, hang, ranked)', async () => {
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <FeedScreen />
      </SafeAreaProvider>,
    );
    expect(await screen.findByText("Marcus's Rooftop")).toBeOnTheScreen();
    expect(screen.getByText('Marcus added a new spot')).toBeOnTheScreen();
    expect(screen.getByText(/Sara logged a hang at/)).toBeOnTheScreen();
    expect(screen.getByText('Dev ranked a spot')).toBeOnTheScreen();
  });
});
