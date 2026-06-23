import { renderHook } from '@testing-library/react-native';

import { useAuthGateStore } from '@/store/authGateStore';
import { useProfileStore } from '@/store/profileStore';
import { useRequireAccount } from '../useRequireAccount';

jest.mock('@/data/repositories', () => ({ usingSupabase: true }));

beforeEach(() => {
  useProfileStore.setState({ email: null });
  useAuthGateStore.setState({ visible: false, reason: '' });
});

describe('useRequireAccount', () => {
  it('blocks a signed-out guest and opens the branded sign-in prompt', () => {
    const { result } = renderHook(() => useRequireAccount());
    expect(result.current('Sign in to rank.')).toBe(false);
    expect(useAuthGateStore.getState().visible).toBe(true);
    expect(useAuthGateStore.getState().reason).toBe('Sign in to rank.');
  });

  it('allows a signed-in user without prompting', () => {
    useProfileStore.setState({ email: 'sam@x.com' });
    const { result } = renderHook(() => useRequireAccount());
    expect(result.current()).toBe(true);
    expect(useAuthGateStore.getState().visible).toBe(false);
  });
});
