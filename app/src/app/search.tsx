import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search as SearchIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exploreCatalog } from '@/domain/exploreView';
import type { Spot } from '@/domain/models';
import { searchSpots } from '@/domain/search';
import { useSpotsStore } from '@/store/spotsStore';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { ScoreBubble } from '@/ui/ScoreBubble';

export default function SearchScreen() {
  const router = useRouter();
  const { local, mine, loaded, load } = useSpotsStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const catalog = exploreCatalog(local, mine);
  const results = searchSpots(catalog, query);
  const open = (spot: Spot) => router.push({ pathname: '/spot/[id]', params: { id: spot.id } });

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.ico} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <View style={styles.searchBar}>
          <SearchIcon size={17} color={colors.muted} strokeWidth={2.2} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search spots, places, vibes…"
            placeholderTextColor={colors.muted2}
            autoFocus
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {query.trim().length === 0 ? (
          <Text style={styles.hint}>Find a spot by name, neighborhood, or category.</Text>
        ) : results.length === 0 ? (
          <Text style={styles.hint}>No spots match “{query.trim()}”.</Text>
        ) : (
          results.map((spot) => (
            <Pressable
              key={spot.id}
              style={({ pressed }) => [styles.row, pressed && pressedStyle]}
              onPress={() => open(spot)}
            >
              <Image source={{ uri: spot.image }} style={styles.thumb} contentFit="cover" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {spot.category} · {spot.location} · {spot.distanceMi} mi
                </Text>
              </View>
              <ScoreBubble score={spot.score} size="sm" />
            </Pressable>
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
    paddingTop: 8,
    paddingBottom: 10,
  },
  ico: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  input: { flex: 1, fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  content: { paddingHorizontal: 18, paddingBottom: 40, paddingTop: 6 },
  hint: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    marginBottom: 10,
    ...inkBorder,
    ...hardShadow(2),
  },
  thumb: { width: 54, height: 54, borderRadius: 11, ...inkBorder },
  name: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  meta: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 2 },
});
