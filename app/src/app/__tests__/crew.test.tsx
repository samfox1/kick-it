import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CrewScreen from '../crew';
import { useCrewStore } from '@/store/crewStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CrewScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  useCrewStore.setState({
    members: [{ id: 'marcus', name: 'Marcus', initial: 'M' }],
    requests: [{ id: 'tess', name: 'Tess', initial: 'T' }],
  });
});

describe('Crew screen', () => {
  it('shows pending requests and current members', () => {
    renderScreen();
    expect(screen.getByText('Requests (1)')).toBeOnTheScreen();
    expect(screen.getByText('Tess')).toBeOnTheScreen();
    expect(screen.getByText('In your crew (1)')).toBeOnTheScreen();
    expect(screen.getByText('Marcus')).toBeOnTheScreen();
  });

  it('accepting a request moves the person into the crew', () => {
    renderScreen();
    fireEvent.press(screen.getByLabelText('Accept Tess'));
    expect(useCrewStore.getState().members.map((m) => m.id)).toContain('tess');
    expect(screen.getByText('In your crew (2)')).toBeOnTheScreen();
  });
});
