import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureSession } from '@/data/supabase/session';
import { useProfileStore } from '@/store/profileStore';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Establish a session + profile on launch so the backend is ready. We don't
  // hydrate the profile store yet — that happens when the data layer swaps to
  // Supabase, so the mock UI's identity stays intact in the meantime.
  useEffect(() => {
    const { member } = useProfileStore.getState();
    ensureSession({ name: member.name, initial: member.initial }).then((res) => {
      if (!res.ok) console.warn('Session bootstrap failed:', res.error.message);
    });
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add" />
          <Stack.Screen name="rank" />
          <Stack.Screen name="spot/[id]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
