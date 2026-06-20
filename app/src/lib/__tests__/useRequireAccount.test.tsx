import { renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useProfileStore } from '@/store/profileStore';
import { useRequireAccount } from '../useRequireAccount';

jest.mock('@/data/repositories', () => ({ usingSupabase: true }));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

beforeEach(() => {
  jest.clearAllMocks();
  useProfileStore.setState({ email: null });
});

describe('useRequireAccount', () => {
  it('blocks a signed-out guest and prompts sign-in', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useRequireAccount());
    expect(result.current('Sign in to rank.')).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('allows a signed-in user without prompting', () => {
    useProfileStore.setState({ email: 'sam@x.com' });
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useRequireAccount());
    expect(result.current()).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});
