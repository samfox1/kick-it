import { render, screen } from '@testing-library/react-native';

import Landing from '../index';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

describe('Landing screen', () => {
  it('shows the tagline and the entry CTA', () => {
    render(<Landing />);
    expect(screen.getByText('For people who like to…')).toBeOnTheScreen();
    expect(screen.getByText('Open the app')).toBeOnTheScreen();
  });
});
