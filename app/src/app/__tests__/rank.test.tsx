import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RankScreen from '../rank';
import { useSpotsStore } from '@/store/spotsStore';
import { makeSpot } from '../../test-utils/factories';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ spotId: 'target' }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Rank screen', () => {
  it('compares the spot against your ranked list', () => {
    useSpotsStore.setState({
      mine: [
        makeSpot({ id: 'target', name: 'Target Spot' }),
        makeSpot({ id: 'other', name: 'Other Spot', score: 7 }),
      ],
      local: [],
      saved: [],
    });
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <RankScreen />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Which did you like better?')).toBeOnTheScreen();
    expect(screen.getByText('Target Spot')).toBeOnTheScreen();
    expect(screen.getByText('Other Spot')).toBeOnTheScreen();
  });
});
