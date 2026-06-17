import { useEffect, useMemo } from 'react';
import { Animated, type ViewProps } from 'react-native';

/** Springs its children in with a scale pop on mount — for satisfying reveals. */
export function PopIn({ children, style, ...rest }: ViewProps) {
  const s = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.spring(s, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [s]);

  const scale = s.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View style={[style, { opacity: s, transform: [{ scale }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}
