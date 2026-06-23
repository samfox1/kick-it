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
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usingSupabase } from '@/data/repositories';
import { loadHandle } from '@/data/supabase/profileSync';
import { ensureSession } from '@/data/supabase/session';
import { useProfileStore } from '@/store/profileStore';
import { AccountGateModal } from '@/ui/AccountGateModal';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // On Supabase, establish a session + profile on launch and hydrate the profile store
  // so identity is the real auth user (your hangs/spots stay yours). We gate render until
  // this resolves so nothing persists under the stale 'sam' identity. Mock mode skips it.
  const [sessionReady, setSessionReady] = useState(!usingSupabase);
  useEffect(() => {
    if (!usingSupabase) return;
    const { member, hydrate, setHandle } = useProfileStore.getState();
    ensureSession({ name: member.name, initial: member.initial })
      .then(async (res) => {
        if (!res.ok) {
          console.warn('Session bootstrap failed:', res.error.message);
          return;
        }
        hydrate(res.value);
        try {
          const saved = await loadHandle(res.value.id);
          if (saved) setHandle(saved);
        } catch (e) {
          console.warn('Loading handle failed:', e); // non-fatal; session already established
        }
      })
      .catch((e) => console.warn('Session bootstrap threw:', e))
      .finally(() => setSessionReady(true));
  }, []);

  if (!loaded || !sessionReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add" />
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
          <Stack.Screen name="choose-username" options={{ gestureEnabled: false }} />
          <Stack.Screen name="rank" />
          <Stack.Screen name="spot/[id]" />
        </Stack>
        <AccountGateModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
