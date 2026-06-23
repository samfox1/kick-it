import { useRouter } from 'expo-router';
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

import { useProfileStore } from '@/store/profileStore';
import { accentRamp, colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';

export default function EditProfileScreen() {
  const router = useRouter();
  const member = useProfileStore((s) => s.member);
  const currentHandle = useProfileStore((s) => s.handle);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [name, setName] = useState(member.name);
  const [handle, setHandle] = useState(currentHandle);

  const save = () => {
    updateProfile({ name: name.trim() || member.name, handle: handle.trim() || currentHandle });
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.ico} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit profile</Text>
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
          <View style={styles.avatarWrap}>
            <Avatar label={member.initial} color={accentRamp[0]} size={84} uri={member.avatar} />
            <Pressable style={styles.changePhoto}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.field} value={name} onChangeText={setName} />

          <Text style={styles.label}>Handle</Text>
          <TextInput
            style={styles.field}
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />

          <Pressable style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
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
  avatarWrap: { alignItems: 'center', marginTop: 10, gap: 10 },
  changePhoto: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  changePhotoText: { fontFamily: font.bold, fontSize: 13, color: colors.blue },
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
