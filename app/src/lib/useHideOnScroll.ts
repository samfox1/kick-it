import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useUiStore } from '@/store/uiStore';
import { tabBarHiddenOnScroll } from '@/lib/scroll';

/**
 * Returns an `onScroll` handler that hides the floating nav as you scroll down and reveals
 * it as you scroll up. Pair with `scrollEventThrottle={16}` on the ScrollView/FlatList.
 * Optionally calls `onChange(scrolled)` so a screen can elevate its header once off the top.
 */
export function useHideOnScroll(onChange?: (scrolled: boolean) => void) {
  const lastY = useRef(0);

  return useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;
      const { tabBarHidden, setTabBarHidden } = useUiStore.getState();
      setTabBarHidden(tabBarHiddenOnScroll(y, dy, tabBarHidden));
      onChange?.(y > 4);
    },
    [onChange],
  );
}
