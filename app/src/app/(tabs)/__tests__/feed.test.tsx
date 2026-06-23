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
  it('renders the activity feed (hangs and rankings, no new spots)', async () => {
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <FeedScreen />
      </SafeAreaProvider>,
    );
    expect(await screen.findByText(/Sara Quinn logged a hang at/)).toBeOnTheScreen();
    expect(screen.getByText('Dev Patel ranked a spot')).toBeOnTheScreen();
    // New spots live on Explore, not the feed.
    expect(screen.queryByText('Marcus added a new spot')).not.toBeOnTheScreen();
  });
});
