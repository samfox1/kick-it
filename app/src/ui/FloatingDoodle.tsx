import { Image, type ImageProps } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { Animated, Easing, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

/** A doodle that drifts gently up/down with a slight rotate, on its own loop. */
export function FloatingDoodle({
  source,
  style,
  imageStyle,
  baseRotate = 0,
  duration = 6000,
  delay = 0,
}: {
  source: ImageProps['source'];
  style: StyleProp<ViewStyle>;
  imageStyle: StyleProp<ImageStyle>;
  baseRotate?: number;
  duration?: number;
  delay?: number;
}) {
  const t = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [t, duration, delay]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: [`${baseRotate}deg`, `${baseRotate + 5}deg`],
  });

  return (
    <Animated.View
      style={[style, { transform: [{ translateY }, { rotate }] }]}
      pointerEvents="none"
    >
      <Image source={source} style={imageStyle} contentFit="contain" />
    </Animated.View>
  );
}
