// Jest setup — runs after the test framework is installed.
// React Native Testing Library auto-extends Jest matchers (v12.4+), so no import needed.
// Add global mocks for native/Expo modules here as screens start needing them.

// Never load the native Supabase client in tests (AsyncStorage/url-polyfill/env). Screen
// code imports it transitively; this uses the manual mock in src/data/supabase/__mocks__.
jest.mock('@/data/supabase/client');

// Haptics are fire-and-forget side effects; no-op them in tests.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Draggable list relies on reanimated/gesture-handler natives; stand in a plain list for tests.
jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { FlatList } = require('react-native');
  return {
    __esModule: true,
    default: ({ data, renderItem, keyExtractor, ListHeaderComponent }: any) =>
      React.createElement(FlatList, {
        data,
        keyExtractor,
        ListHeaderComponent,
        renderItem: ({ item, index }: any) =>
          renderItem({ item, getIndex: () => index, drag: () => {}, isActive: false }),
      }),
    ScaleDecorator: ({ children }: any) => children,
  };
});
