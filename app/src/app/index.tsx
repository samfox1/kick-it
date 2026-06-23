import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, hardShadow, inkBorder } from '@/theme/tokens';
import { FloatingDoodle } from '@/ui/FloatingDoodle';
import bench from '../../assets/images/bench.png';
import beanbag from '../../assets/images/beanbag.png';
import barstool from '../../assets/images/barstool.png';
import couch from '../../assets/images/couch_image.png';
import wordmark from '../../assets/images/wordmark.png';

const ONBOARDED_KEY = 'kickit.onboarded';

export default function Landing() {
  const router = useRouter();
  // Show the landing once; later launches go straight to the feed.
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((v) => setSeen(v === '1'))
      .catch(() => setSeen(false)); // storage read failed → show the landing rather than hang
  }, []);

  const enter = () => {
    void AsyncStorage.setItem(ONBOARDED_KEY, '1');
    router.replace('/feed');
  };

  if (seen === null) return <View style={styles.root} />; // brief blank while we check
  if (seen) return <Redirect href="/feed" />;

  return (
    <View style={styles.root}>
      <FloatingDoodle
        source={bench}
        style={styles.bench}
        imageStyle={styles.benchImg}
        baseRotate={-6}
        duration={7200}
      />
      <FloatingDoodle
        source={beanbag}
        style={styles.beanbag}
        imageStyle={styles.beanbagImg}
        baseRotate={8}
        duration={6600}
        delay={400}
      />
      <FloatingDoodle
        source={barstool}
        style={styles.barstool}
        imageStyle={styles.barstoolImg}
        baseRotate={6}
        duration={5400}
        delay={800}
      />
      <FloatingDoodle
        source={couch}
        style={styles.couch}
        imageStyle={styles.couchImg}
        baseRotate={-16}
        duration={8000}
        delay={200}
      />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>For people who like to…</Text>
        <Image source={wordmark} style={styles.wordmark} contentFit="contain" />
        <Pressable style={styles.cta} onPress={enter}>
          <Text style={styles.ctaText}>Open the app</Text>
          <ArrowRight size={16} color={colors.ink} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 24, zIndex: 5 },
  eyebrow: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginBottom: 14 },
  wordmark: { width: 232, height: 110 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    backgroundColor: colors.paper,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    ...inkBorder,
    borderWidth: 2.5,
    ...hardShadow(3),
  },
  ctaText: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },

  bench: { position: 'absolute', top: '7%', left: '3%' },
  benchImg: { width: 205, height: 137 },
  beanbag: { position: 'absolute', top: '13%', right: '2%' },
  beanbagImg: { width: 178, height: 150 },
  barstool: { position: 'absolute', bottom: '13%', right: '5%' },
  barstoolImg: { width: 138, height: 179 },
  couch: { position: 'absolute', bottom: '5%', left: '2%' },
  couchImg: { width: 208, height: 135 },
});
