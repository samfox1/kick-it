import { fireEvent, render, screen } from '@testing-library/react-native';

import { makeSpot } from '@/test-utils/factories';
import { SpotRow } from '../SpotRow';

const mockPush = jest.fn();
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('SpotRow', () => {
  beforeEach(() => mockPush.mockClear());

  it('navigates to the spot page with the spot id when pressed', () => {
    const spot = makeSpot({ id: 'abc', name: 'Cedar Bench' });
    render(<SpotRow spot={spot} />);
    fireEvent.press(screen.getByLabelText('View Cedar Bench'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/spot/[id]', params: { id: 'abc' } });
  });

  it('shows category and distance for an unranked row', () => {
    render(<SpotRow spot={makeSpot({ category: 'park', distanceMi: 2 })} />);
    expect(screen.getByText('park · 2 mi')).toBeOnTheScreen();
  });

  it('shows just the category (no distance) when a rank is given', () => {
    render(<SpotRow spot={makeSpot({ category: 'park', distanceMi: 2 })} rank={1} />);
    expect(screen.getByText('park')).toBeOnTheScreen();
    expect(screen.queryByText('park · 2 mi')).not.toBeOnTheScreen();
  });
});
