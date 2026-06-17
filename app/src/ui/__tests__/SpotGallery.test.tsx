import { render, screen } from '@testing-library/react-native';

import { SpotGallery } from '../SpotGallery';

jest.mock('expo-image', () => ({ Image: 'Image' }));

describe('SpotGallery', () => {
  it('renders one page per photo and shows dots when there are multiple', () => {
    render(<SpotGallery images={['a.jpg', 'b.jpg', 'c.jpg']} />);
    expect(screen.getAllByTestId('spotGalleryPhoto')).toHaveLength(3);
    expect(screen.getByTestId('spotGalleryDots')).toBeOnTheScreen();
  });

  it('hides the dots when there is only one photo', () => {
    render(<SpotGallery images={['solo.jpg']} />);
    expect(screen.getAllByTestId('spotGalleryPhoto')).toHaveLength(1);
    expect(screen.queryByTestId('spotGalleryDots')).not.toBeOnTheScreen();
  });
});
