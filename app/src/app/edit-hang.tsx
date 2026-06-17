import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHangsStore } from '@/store/hangsStore';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';

export default function EditHangScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const hang = useHangsStore((s) => s.hangs.find((h) => h.id === id));
  const updateHang = useHangsStore((s) => s.updateHang);
  const [title, setTitle] = useState(hang?.title ?? '');
  const [note, setNote] = useState(hang?.note ?? '');

  const save = () => {
    if (id) updateHang(id, { title: title.trim() || 'Untitled hang', note: note.trim() });
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit hang</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!hang ? (
            <Text style={styles.notFound}>Hang not found.</Text>
          ) : (
            <>
              <Text style={styles.label}>What happened?</Text>
              <TextInput style={styles.field} value={title} onChangeText={setTitle} />

              <Text style={styles.label}>The story</Text>
              <TextInput
                style={[styles.field, styles.area]}
                value={note}
                onChangeText={setNote}
                multiline
              />

              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && pressedStyle]}
                onPress={save}
              >
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
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
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  notFound: { fontFamily: font.bold, color: colors.muted, textAlign: 'center', marginTop: 40 },
  label: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: colors.ink,
    marginTop: 20,
    marginBottom: 9,
  },
  field: {
    borderRadius: radii.md,
    padding: 13,
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.ink,
    ...inkBorder,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 28,
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...inkBorder,
    ...hardShadow(4),
  },
  saveText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
});
