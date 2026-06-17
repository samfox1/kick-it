import { create } from 'zustand';

/** Cross-screen UI state. Currently: whether the floating nav is hidden (hide-on-scroll). */
interface UiState {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  tabBarHidden: false,
  setTabBarHidden: (tabBarHidden) =>
    set((s) => (s.tabBarHidden === tabBarHidden ? s : { tabBarHidden })),
}));
