import { useEffect, useMemo } from 'react';
import { Animated, type ViewProps } from 'react-native';

/** Fades + slides its children up on mount. `index` staggers a list so items cascade in. */
export function AppearingView({
  index = 0,
  children,
  style,
  ...rest
}: ViewProps & { index?: number }) {
  const t = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const timer = setTimeout(
      () => Animated.timing(t, { toValue: 1, duration: 320, useNativeDriver: true }).start(),
      Math.min(index, 6) * 60,
    );
    return () => clearTimeout(timer);
  }, [t, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
