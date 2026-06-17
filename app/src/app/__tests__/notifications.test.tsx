import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NotificationsScreen from '../notifications';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Notifications screen', () => {
  it('lists notifications', () => {
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <NotificationsScreen />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Notifications')).toBeOnTheScreen();
    expect(screen.getByText(/Marcus added a new spot/)).toBeOnTheScreen();
  });
});
