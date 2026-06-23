import { render, screen } from '@testing-library/react-native';

import Landing from '../index';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  Redirect: () => null,
}));

describe('Landing screen', () => {
  it('shows the tagline and the entry CTA on first launch', async () => {
    render(<Landing />);
    // Renders after the one-time "already onboarded?" check resolves (AsyncStorage = null).
    expect(await screen.findByText('For people who like to…')).toBeOnTheScreen();
    expect(screen.getByText('Open the app')).toBeOnTheScreen();
  });
});
