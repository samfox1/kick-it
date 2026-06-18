import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfileScreen from '../profile';
import { useProfileStore } from '@/store/profileStore';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ProfileScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() =>
  useProfileStore.setState({
    member: { id: 'sam', name: 'Sam Fox', initial: 'S' },
    handle: '@samkicks',
  }),
);

describe('Profile screen', () => {
  it('shows the Saved/Hangs tabs and empty state', () => {
    renderScreen();
    expect(screen.getByText('Saved spots')).toBeOnTheScreen();
    expect(screen.getByText(/No saved spots yet/)).toBeOnTheScreen();
  });

  it('shows the live profile name and handle from the store', () => {
    useProfileStore.setState({
      member: { id: 'sam', name: 'Renamed Sam', initial: 'R' },
      handle: '@renamed',
    });
    renderScreen();
    expect(screen.getByText('Renamed Sam')).toBeOnTheScreen();
    expect(screen.getByText('@renamed')).toBeOnTheScreen();
  });
});
