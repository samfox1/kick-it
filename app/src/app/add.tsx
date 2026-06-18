import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Check, Images, MapPin, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { findDuplicateCandidates } from '@/domain/dedupe';
import { exploreCatalog } from '@/domain/exploreView';
import { useProfileStore } from '@/store/profileStore';
import type { AccessLevel } from '@/domain/models';
import { insertIndex, nextComparisonIndex } from '@/domain/rankInsert';
import { scoreFromRank } from '@/domain/ranking';
import { visibleMySpots } from '@/domain/spotsView';
import { useHangsStore } from '@/store/hangsStore';
import { useSpotsStore } from '@/store/spotsStore';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { AccessSticker } from '@/ui/AccessSticker';
import { CategoryBadge } from '@/ui/CategoryBadge';
import { ComparisonStack } from '@/ui/ComparisonStack';
import { PopIn } from '@/ui/PopIn';
import { ScoreBubble } from '@/ui/ScoreBubble';

// Mock "you are here", near the seeded spot cluster, so duplicate detection is demoable.
// A real build pins the spot's location from a map or the device GPS.
const DEMO_LOCATION = { lat: 43.0731, lng: -89.4012 };

const CATEGORIES = ['Basement', 'Bar patio', 'Park', 'On water', 'Backyard', 'Rooftop'];
const ACCESS: { value: AccessLevel; label: string; note: string; glyph: string }[] = [
  { value: 'open', label: 'Open to all', note: 'Anyone on Kick It can see it.', glyph: '◎' },
  {
    value: 'friends',
    label: 'Friends only',
    note: 'Just your crew. Shows in their feed.',
    glyph: '●',
  },
  { value: 'invite', label: 'Invite only', note: 'Hidden. You add people one by one.', glyph: '★' },
];
const TAGS_BY_CATEGORY: { label: string; ids: string[] }[] = [
  { label: 'Outdoors', ids: ['sunset', 'water', 'shaded', 'view'] },
  { label: 'Vibe', ids: ['cannabis', 'loud', 'byob', 'private'] },
  { label: 'Features', ids: ['aux', 'charging', 'wifi', 'bathroom', 'parking'] },
  { label: 'Access', ids: ['free', 'food', 'dog', 'biggroup', 'openlate'] },
];

type Answer = 'better' | 'worse';

export default function AddScreen() {
  const router = useRouter();
  const { spotId } = useLocalSearchParams<{ spotId?: string }>();
  const { local, mine, loaded, load } = useSpotsStore();
  const addSpot = useSpotsStore((s) => s.addSpot);
  const logHang = useHangsStore((s) => s.logHang);
  const me = useProfileStore((s) => s.member);
  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  // Logging a hang at an existing spot: its fixed details come along automatically.
  const intendsHang = !!spotId;
  const spot = spotId ? [...mine, ...local].find((s) => s.id === spotId) : undefined;

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Backyard');
  const [access, setAccess] = useState<AccessLevel>('friends');
  const [tags, setTags] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [hangTitle, setHangTitle] = useState('');
  const [hangNote, setHangNote] = useState('');
  const [description, setDescription] = useState('');
  const [firstHang, setFirstHang] = useState('');
  const [draftLoc, setDraftLoc] = useState<{ lat: number; lng: number } | null>(null);

  const lastStep = intendsHang ? 2 : 5;

  // Find spots that might already be this place, near the pinned location. Location is the
  // primary signal; the name just ranks. See docs/DEDUPE.md.
  const catalog = exploreCatalog(local, mine);
  const duplicates =
    draftLoc && name.trim().length > 0
      ? findDuplicateCandidates(catalog, { name, ...draftLoc })
      : [];

  const pinLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        const pos = await Location.getCurrentPositionAsync({});
        setDraftLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        return;
      }
    } catch {
      // fall through to the demo location
    }
    setDraftLoc(DEMO_LOCATION);
  };

  const ranked = visibleMySpots(mine);
  const compareIdx = nextComparisonIndex(ranked.length, answers);
  const rankingDone = step === 5 && compareIdx === -1;
  const finalIndex = insertIndex(ranked.length, answers);
  const finalScore = scoreFromRank(finalIndex, ranked.length + 1);

  const postHang = async () => {
    if (spotId) {
      const res = await logHang({
        spotId,
        author: me,
        title: hangTitle.trim() || 'Untitled hang',
        note: hangNote.trim(),
        image: photos[0] ?? '',
        attendees: [],
      });
      if (!res.ok) return; // stay on screen so the write isn't silently lost
    }
    router.back();
  };

  const finishAddSpot = async () => {
    const res = await addSpot(
      {
        name: name.trim() || 'New spot',
        category: category.toLowerCase(),
        access,
        distanceMi: 0,
        location: '',
        image: photos[0] ?? '',
        images: photos,
        characteristicIds: Object.keys(tags).filter((id) => tags[id]),
        description: description.trim() || undefined,
        lat: draftLoc?.lat,
        lng: draftLoc?.lng,
      },
      finalIndex,
    );
    if (!res.ok) return;
    // Optionally log the first hang at the brand-new spot (no photo of its own yet).
    if (firstHang.trim()) {
      const hangRes = await logHang({
        spotId: res.value.id,
        author: me,
        title: 'First hang',
        note: firstHang.trim(),
        image: '',
        attendees: [],
      });
      if (!hangRes.ok) return; // spot saved; surface the hang failure instead of pretending success
    }
    router.back();
  };

  const addFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setPhotos((p) => [...p, res.assets[0].uri]);
  };
  const addFromLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets.map((a) => a.uri)]);
  };
  const removePhoto = (uri: string) => setPhotos((p) => p.filter((x) => x !== uri));

  // A multi-photo picker: a strip of added thumbnails + a camera tile. Reused in both flows.
  const photoPicker = (
    <>
      <Text style={styles.label}>{photos.length ? 'Photos' : 'Add photos'}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoStrip}
      >
        {photos.map((uri) => (
          <View key={uri} style={styles.photoThumb}>
            <Image source={{ uri }} style={styles.photoThumbImg} contentFit="cover" />
            <Pressable style={styles.photoRemove} onPress={() => removePhoto(uri)} hitSlop={6}>
              <X size={12} color="#fff" strokeWidth={2.6} />
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.photoAdd} onPress={addFromCamera}>
          <Camera size={26} color={colors.ink} strokeWidth={2} />
          <Text style={styles.photoAddText}>Camera</Text>
        </Pressable>
      </ScrollView>
      <Pressable style={styles.libraryRow} onPress={addFromLibrary}>
        <Images size={15} color={colors.blue} strokeWidth={2} />
        <Text style={styles.libraryText}>Add from your library</Text>
      </Pressable>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.x} onPress={() => router.back()}>
          <X size={18} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{intendsHang ? 'Log a hang' : 'Add a spot'}</Text>
        <Text style={styles.stepN}>
          Step {step} of {lastStep}
        </Text>
      </View>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${(step / lastStep) * 100}%` }]} />
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
          {intendsHang && !spot && (
            <View style={styles.resolving}>
              <ActivityIndicator color={colors.ink} />
            </View>
          )}

          {intendsHang && spot && step === 1 && (
            <>
              <Text style={styles.label}>Logging a hang at</Text>
              <View style={styles.spotBanner}>
                <Image
                  source={{ uri: spot.image }}
                  style={styles.spotThumb}
                  contentFit="cover"
                  transition={120}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.spotName} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <View style={styles.spotMetaRow}>
                    <MapPin size={13} color={colors.muted} strokeWidth={2} />
                    <Text style={styles.spotMeta} numberOfLines={1}>
                      {spot.location} · {spot.category}
                    </Text>
                  </View>
                  <View style={styles.spotStickerRow}>
                    <AccessSticker access={spot.access} />
                  </View>
                </View>
              </View>
              <Text style={styles.bannerHint}>
                Name, location, and access carry over automatically — just add tonight.
              </Text>

              {photoPicker}
            </>
          )}

          {intendsHang && spot && step === 2 && (
            <>
              <Text style={styles.label}>What happened?</Text>
              <TextInput
                style={styles.field}
                value={hangTitle}
                onChangeText={setHangTitle}
                placeholder="Golden hour burgers"
                placeholderTextColor={colors.muted2}
              />
              <Text style={styles.label}>Tell the story</Text>
              <TextInput
                style={[styles.field, styles.fieldArea]}
                value={hangNote}
                onChangeText={setHangNote}
                multiline
                placeholder="Who came, what you got into, why it was worth it…"
                placeholderTextColor={colors.muted2}
              />
              <Pressable style={styles.postBtn} onPress={postHang}>
                <Text style={styles.postText}>Post hang</Text>
              </Pressable>
            </>
          )}

          {!intendsHang && step === 1 && (
            <>
              {photoPicker}

              <Text style={styles.label}>What&apos;s it called?</Text>
              <TextInput
                style={styles.field}
                value={name}
                onChangeText={setName}
                placeholder="Nia's Firepit"
                placeholderTextColor={colors.muted2}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.catChip, category === c && styles.catChipOn]}
                  >
                    <Text style={[styles.catChipText, category === c && styles.catChipTextOn]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Where is it?</Text>
              <Pressable style={[styles.locBtn, draftLoc && styles.locBtnOn]} onPress={pinLocation}>
                {draftLoc ? (
                  <Check size={17} color="#15803d" strokeWidth={2.6} />
                ) : (
                  <MapPin size={17} color={colors.blue} strokeWidth={2.4} />
                )}
                <Text style={styles.locBtnText}>
                  {draftLoc ? 'Location pinned' : 'Pin this spot’s location'}
                </Text>
              </Pressable>

              {duplicates.length > 0 && (
                <View style={styles.dupPanel}>
                  <Text style={styles.dupTitle}>Is it one of these?</Text>
                  <Text style={styles.dupSub}>
                    Spots already here. Tap one to add your hang instead of a duplicate.
                  </Text>
                  {duplicates.map(({ spot: d, meters }) => (
                    <Pressable
                      key={d.id}
                      style={styles.dupRow}
                      onPress={() =>
                        router.replace({ pathname: '/spot/[id]', params: { id: d.id } })
                      }
                    >
                      <Image source={{ uri: d.image }} style={styles.dupThumb} contentFit="cover" />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.dupName} numberOfLines={1}>
                          {d.name}
                        </Text>
                        <Text style={styles.dupMeta}>
                          {Math.round(meters)} m away · {d.location}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                  <Text style={styles.dupNone}>None of these — mine is new ↓</Text>
                </View>
              )}
            </>
          )}

          {!intendsHang && step === 2 && (
            <>
              <Text style={styles.label}>Who can find this spot?</Text>
              {ACCESS.map((a) => (
                <Pressable
                  key={a.value}
                  onPress={() => setAccess(a.value)}
                  style={[styles.access, access === a.value && styles.accessOn]}
                >
                  <Text style={styles.accessGlyph}>{a.glyph}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accessLabel}>{a.label}</Text>
                    <Text style={styles.accessNote}>{a.note}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          {!intendsHang && step === 3 && (
            <>
              <Text style={styles.label}>Tag what&apos;s true about this spot</Text>
              <Text style={styles.sub}>
                Pick the badges that fit. Your crew can endorse them later.
              </Text>
              {TAGS_BY_CATEGORY.map((group) => (
                <View key={group.label}>
                  <Text style={styles.catLabel}>{group.label}</Text>
                  <View style={styles.badges}>
                    {group.ids.map((id) => (
                      <CategoryBadge
                        key={id}
                        id={id}
                        endorsed={!!tags[id]}
                        onPress={() => setTags((t) => ({ ...t, [id]: !t[id] }))}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}

          {!intendsHang && step === 4 && (
            <>
              <Text style={styles.label}>Describe the vibe</Text>
              <TextInput
                style={[styles.field, styles.fieldArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="What makes this spot good?"
                placeholderTextColor={colors.muted2}
              />
              <Text style={styles.label}>Log your first hang (optional)</Text>
              <TextInput
                style={styles.field}
                value={firstHang}
                onChangeText={setFirstHang}
                placeholder="One line about tonight…"
                placeholderTextColor={colors.muted2}
              />
            </>
          )}

          {!intendsHang && step === 5 && !rankingDone && ranked.length > 0 && (
            <>
              <Text style={styles.sub}>
                A couple quick taps set the score. No stars, no overthinking.
              </Text>
              <ComparisonStack
                subjectName={name || 'New spot'}
                ranked={ranked}
                answers={answers}
                onAnswer={(a) => setAnswers((prev) => [...prev, a])}
              />
            </>
          )}

          {!intendsHang && step === 5 && (rankingDone || ranked.length === 0) && (
            <View style={styles.reveal}>
              <PopIn>
                <ScoreBubble score={finalScore} size="lg" />
              </PopIn>
              <Text style={styles.revealName}>{name || 'New spot'}</Text>
              <Text style={styles.revealSub}>Lands at #{finalIndex + 1} on your ranked list</Text>
              <Pressable style={styles.doneBtn} onPress={finishAddSpot}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {step < lastStep && (!intendsHang || !!spot) && (
        <View style={styles.footer}>
          <Pressable style={styles.continue} onPress={() => setStep((s) => s + 1)}>
            <Text style={styles.continueText}>
              {!intendsHang && step === 4 ? 'Finish up' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8 },
  x: {
    width: 36,
    height: 36,
    borderRadius: 11,
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
  stepN: {
    width: 60,
    textAlign: 'right',
    fontFamily: font.bold,
    fontSize: 11,
    color: colors.muted,
  },
  progress: {
    height: 9,
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 6,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    ...inkBorder,
  },
  progressFill: { height: '100%', backgroundColor: colors.blue },
  content: { paddingHorizontal: 18, paddingBottom: 120, paddingTop: 6 },
  label: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: colors.ink,
    marginTop: 18,
    marginBottom: 9,
  },
  sub: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginBottom: 12 },
  resolving: { paddingTop: 60, alignItems: 'center' },
  spotBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 11,
    borderRadius: radii.lg,
    backgroundColor: colors.soft,
    ...inkBorder,
    ...hardShadow(3),
  },
  spotThumb: { width: 58, height: 58, borderRadius: 11, ...inkBorder },
  spotName: { fontFamily: font.extrabold, fontSize: 16, letterSpacing: -0.2, color: colors.ink },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  spotMeta: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.muted },
  spotStickerRow: { flexDirection: 'row', marginTop: 8 },
  bannerHint: {
    fontFamily: font.semibold,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 9,
    lineHeight: 16,
  },
  postBtn: {
    marginTop: 22,
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...inkBorder,
    ...hardShadow(4),
  },
  postText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
  photoStrip: { gap: 10, paddingVertical: 2, paddingRight: 4 },
  photoThumb: {
    width: 110,
    height: 130,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    ...inkBorder,
  },
  photoThumbImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 110,
    height: 130,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoAddText: { fontFamily: font.bold, fontSize: 12, color: colors.ink },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 9,
  },
  libraryText: { fontFamily: font.bold, fontSize: 13, color: colors.blue },
  field: {
    borderRadius: radii.md,
    padding: 13,
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.ink,
    ...inkBorder,
  },
  fieldArea: { minHeight: 84, textAlignVertical: 'top' },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  locBtnOn: { backgroundColor: '#e4f7ea' },
  locBtnText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  dupPanel: {
    marginTop: 14,
    padding: 13,
    borderRadius: radii.lg,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#c2620b',
  },
  dupTitle: { fontFamily: font.extrabold, fontSize: 15, color: '#9a4d09' },
  dupSub: {
    fontFamily: font.semibold,
    fontSize: 11.5,
    color: '#9a4d09',
    marginTop: 2,
    opacity: 0.8,
  },
  dupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 11,
    padding: 8,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
  },
  dupThumb: { width: 46, height: 46, borderRadius: 9, ...inkBorder },
  dupName: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  dupMeta: { fontFamily: font.semibold, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  dupNone: {
    fontFamily: font.bold,
    fontSize: 12,
    color: '#9a4d09',
    textAlign: 'center',
    marginTop: 12,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  catChip: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  catChipOn: { backgroundColor: colors.blue },
  catChipText: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
  catChipTextOn: { color: '#fff' },
  access: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    marginBottom: 11,
    ...inkBorder,
    ...hardShadow(2),
  },
  accessOn: { borderColor: colors.blue, borderWidth: 2 },
  accessGlyph: { fontSize: 18 },
  accessLabel: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  accessNote: { fontFamily: font.semibold, fontSize: 11, color: colors.muted, marginTop: 1 },
  catLabel: {
    fontFamily: font.extrabold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginTop: 14,
    marginBottom: 8,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 7, rowGap: 12 },
  reveal: { alignItems: 'center', marginTop: 24 },
  revealName: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink, marginTop: 12 },
  revealSub: { fontFamily: font.semibold, fontSize: 13, color: colors.muted, marginTop: 4 },
  doneBtn: {
    marginTop: 22,
    backgroundColor: colors.blue,
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: radii.md,
    ...inkBorder,
    ...hardShadow(4),
  },
  doneText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    paddingBottom: 28,
    backgroundColor: colors.paper,
  },
  continue: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    ...inkBorder,
    ...hardShadow(4),
  },
  continueText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
});
