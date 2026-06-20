import { useRouter } from 'expo-router';
import { Compass, Home, MapPin, Plus, User, type LucideIcon } from 'lucide-react-native';
import { createElement, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRequireAccount } from '@/lib/useRequireAccount';
import { useUiStore } from '@/store/uiStore';
import { colors, hardShadow, inkBorder } from '@/theme/tokens';

const ICONS: Record<string, LucideIcon> = {
  feed: Home,
  explore: Compass,
  spots: MapPin,
  profile: User,
};

/** A nav icon that springs up + reveals a dot when it becomes the active tab. */
function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  const a = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(a, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, a]);

  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
      {createElement(Icon, {
        size: 24,
        color: focused ? colors.blue : '#9a9aa0',
        strokeWidth: 2,
      })}
      <Animated.View style={[styles.activeDot, { opacity: a, transform: [{ scale: a }] }]} />
    </Animated.View>
  );
}

/** Minimal shape we use from the navigator's tabBar props (avoids a hard dep on nav types). */
export interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

/** Floating white pill nav with a blue center "+" that opens the Add flow. */
export function TabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();
  const requireAccount = useRequireAccount();
  const insets = useSafeAreaInsets();
  const hidden = useUiStore((s) => s.tabBarHidden);
  const setHidden = useUiStore((s) => s.setTabBarHidden);
  const ty = useRef(new Animated.Value(0)).current;
  const routeByName = (name: string) => state.routes.find((r) => r.name === name);

  // Slide the pill down when hidden, back up when shown.
  useEffect(() => {
    Animated.timing(ty, {
      toValue: hidden ? 130 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [hidden, ty]);

  // Always reveal the nav when switching tabs.
  useEffect(() => {
    setHidden(false);
  }, [state.index, setHidden]);

  const tab = (name: string) => {
    const route = routeByName(name);
    if (!route) return null;
    const focused = state.routes[state.index]?.name === name;
    return (
      <Pressable
        key={name}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onPress={() => navigation.navigate(route.name)}
        style={styles.tab}
      >
        <TabIcon Icon={ICONS[name] ?? Home} focused={focused} />
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom || 14 }]}>
      <Animated.View style={[styles.pill, { transform: [{ translateY: ty }] }]}>
        {tab('feed')}
        {tab('explore')}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a spot"
          onPress={() => {
            if (requireAccount('Sign in to add a spot.')) router.push('/add');
          }}
          style={styles.plus}
        >
          <Plus size={24} color="#fff" strokeWidth={2.4} />
        </Pressable>
        {tab('spots')}
        {tab('profile')}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 330,
    height: 60,
    paddingHorizontal: 18,
    backgroundColor: colors.paper,
    borderRadius: 30,
    ...inkBorder,
    ...hardShadow(4),
  },
  tab: { width: 44, alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.blue, marginTop: 3 },
  plus: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
});
