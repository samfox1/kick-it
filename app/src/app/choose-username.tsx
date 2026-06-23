import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '@/store/profileStore';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';

/** First-time setup: pick a username (never derived from your email). Keeps people a little
 *  anonymous, which makes for bolder hang posts. */
export default function ChooseUsernameScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Letters, numbers, underscores; 3–20 chars.
  const clean = username.trim().replace(/^@+/, '');
  const valid = /^[a-zA-Z0-9_]{3,20}$/.test(clean);

  const save = () => {
    if (!valid) {
      setError('3–20 letters, numbers, or underscores.');
      return;
    }
    updateProfile({ name: clean, handle: `@${clean}` });
    router.replace('/feed');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Pick a username</Text>
          <Text style={styles.sub}>
            This is how you&apos;ll show up on Kick It. Be yourself — or don&apos;t.
          </Text>

          <View style={styles.inputRow}>
            <Text style={styles.at}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={colors.muted2}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.btn, !valid && styles.btnOff]} onPress={save} disabled={!valid}>
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
  body: { paddingHorizontal: 24, paddingTop: 48 },
  title: { fontFamily: font.extrabold, fontSize: 26, color: colors.ink },
  sub: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
    marginTop: 10,
    marginBottom: 28,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    ...inkBorder,
    ...hardShadow(2),
  },
  at: { fontFamily: font.extrabold, fontSize: 18, color: colors.muted2 },
  input: {
    flex: 1,
    height: 54,
    paddingLeft: 6,
    fontFamily: font.semibold,
    fontSize: 17,
    color: colors.ink,
  },
  error: { fontFamily: font.semibold, fontSize: 13, color: colors.like, marginTop: 10 },
  btn: {
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    ...inkBorder,
    ...hardShadow(3),
  },
  btnOff: { opacity: 0.5 },
  btnText: { fontFamily: font.extrabold, fontSize: 16, color: '#fff' },
});
