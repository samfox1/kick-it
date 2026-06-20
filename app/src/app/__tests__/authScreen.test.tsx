import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from '../auth';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

const mockSendEmailOtp = jest.fn();
jest.mock('@/data/supabase/auth', () => ({
  sendEmailOtp: (...args: unknown[]) => mockSendEmailOtp(...args),
  verifyEmailOtp: jest.fn(),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AuthScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => mockSendEmailOtp.mockReset());

describe('AuthScreen', () => {
  it('starts on the email step', () => {
    renderScreen();
    expect(screen.getByText("What's your email?")).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('you@email.com')).toBeOnTheScreen();
  });

  it('shows a validation error for an invalid email and does not request a code', () => {
    renderScreen();
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), 'not-an-email');
    fireEvent.press(screen.getByText('Send code'));
    expect(screen.getByText('Enter a valid email.')).toBeOnTheScreen();
    expect(mockSendEmailOtp).not.toHaveBeenCalled();
  });

  it('advances to the code step after a successful send', async () => {
    mockSendEmailOtp.mockResolvedValue({ ok: true, value: undefined });
    renderScreen();
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), 'sam@x.com');
    fireEvent.press(screen.getByText('Send code'));
    expect(mockSendEmailOtp).toHaveBeenCalledWith('sam@x.com');
    await waitFor(() => expect(screen.getByPlaceholderText('000000')).toBeOnTheScreen());
  });

  it('surfaces a send failure', async () => {
    mockSendEmailOtp.mockResolvedValue({
      ok: false,
      error: { code: 'network', message: 'offline' },
    });
    renderScreen();
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), 'sam@x.com');
    fireEvent.press(screen.getByText('Send code'));
    await waitFor(() => expect(screen.getByText('offline')).toBeOnTheScreen());
  });
});
