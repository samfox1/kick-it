import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHideOnScroll } from '@/lib/useHideOnScroll';
import { useFeedStore } from '@/store/feedStore';
import { colors, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { AppearingView } from '@/ui/AppearingView';
import { FeedCard } from '@/ui/FeedCard';
import { Skeleton } from '@/ui/Skeleton';
import wordmark from '../../../assets/images/wordmark.png';

function FeedSkeleton() {
  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skelCard}>
          <View style={styles.skelHead}>
            <Skeleton width={38} height={38} radius={19} />
            <View style={{ gap: 6 }}>
              <Skeleton width={150} height={12} />
              <Skeleton width={80} height={10} />
            </View>
          </View>
          <Skeleton width="100%" height={200} radius={0} />
          <View style={{ padding: 16, gap: 10 }}>
            <Skeleton width={180} height={20} />
            <Skeleton width={120} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { items, loaded, load } = useFeedStore();
  const [elevated, setElevated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onScroll = useHideOnScroll(setElevated);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={[styles.header, elevated && styles.headerElevated]}>
        <Image source={wordmark} style={styles.logo} contentFit="contain" />
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
          onPress={() => router.push('/search')}
        >
          <Search size={19} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={19} color={colors.ink} strokeWidth={2} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
        }
      >
        {!loaded ? (
          <FeedSkeleton />
        ) : (
          items.map((item, i) => (
            <AppearingView key={item.id} index={i}>
              <FeedCard item={item} />
            </AppearingView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: colors.paper,
    zIndex: 10,
  },
  headerElevated: {
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  logo: { width: 66, height: 30 },
  ico: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.like,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  skelCard: {
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 20,
    ...inkBorder,
    ...hardShadow(4),
  },
  skelHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
});
