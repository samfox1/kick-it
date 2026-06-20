import { useRouter } from 'expo-router';
import { Mail, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendEmailOtp, verifyEmailOtp } from '@/data/supabase/auth';
import { completeSignIn } from '@/lib/authFlow';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (busy) return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) return setError('Enter a valid email.');
    setBusy(true);
    setError(null);
    try {
      const res = await sendEmailOtp(trimmed);
      if (res.ok) {
        setEmail(trimmed);
        setStep('code');
      } else {
        setError(res.error.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (busy) return;
    if (code.trim().length < 6) return setError('Enter the 6-digit code.');
    setBusy(true);
    setError(null);
    try {
      const res = await verifyEmailOtp(email, code.trim());
      if (!res.ok) {
        setError(res.error.message);
        setBusy(false);
        return;
      }
      await completeSignIn(res.value.member, res.value.email);
      router.back(); // success → modal unmounts; no need to reset busy
    } catch {
      setError('Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>{step === 'email' ? 'Sign in' : 'Enter code'}</Text>
        <Pressable style={styles.ico} onPress={() => router.back()} accessibilityLabel="Close">
          <X size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Mail size={28} color={colors.blue} strokeWidth={2.2} />
        </View>

        {step === 'email' ? (
          <>
            <Text style={styles.title}>What&apos;s your email?</Text>
            <Text style={styles.sub}>
              We&apos;ll email you a 6-digit code to sign in or create your account.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.muted2}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              inputMode="email"
              autoFocus
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={[styles.btn, busy && styles.btnOff]} onPress={send} disabled={busy}>
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.sub}>Enter the 6-digit code sent to {email}.</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="000000"
              placeholderTextColor={colors.muted2}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={[styles.btn, busy && styles.btnOff]} onPress={verify} disabled={busy}>
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Verify</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setStep('email')} disabled={busy} hitSlop={8}>
              <Text style={styles.link}>Use a different email</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.soft,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.ink,
  },
  body: { paddingHorizontal: 22, paddingTop: 24, alignItems: 'center' },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(3),
    marginBottom: 18,
  },
  title: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink, textAlign: 'center' },
  sub: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    fontFamily: font.semibold,
    fontSize: 16,
    color: colors.ink,
    ...inkBorder,
    ...hardShadow(2),
  },
  codeInput: { textAlign: 'center', letterSpacing: 8, fontSize: 22, fontFamily: font.extrabold },
  error: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.like,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  btn: {
    width: '100%',
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    ...inkBorder,
    ...hardShadow(3),
  },
  btnOff: { opacity: 0.6 },
  btnText: { fontFamily: font.extrabold, fontSize: 16, color: '#fff' },
  link: { fontFamily: font.bold, fontSize: 14, color: colors.blue, marginTop: 18 },
});
