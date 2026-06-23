import { create } from 'zustand';

/**
 * Drives the branded "create an account" prompt. The write-gate (useRequireAccount) is
 * imperative, so it triggers this store; a single <AccountGateModal/> renders the modal.
 */
interface AuthGateState {
  visible: boolean;
  reason: string;
  show: (reason: string) => void;
  hide: () => void;
}

export const useAuthGateStore = create<AuthGateState>((set) => ({
  visible: false,
  reason: '',
  show: (reason) => set({ visible: true, reason }),
  hide: () => set({ visible: false }),
}));
