// One-off seed: load the mock spots into Supabase as open spots so the live
// backend has content. Idempotent by name. Run:
//   cd app && set -a; . ./.env.local; set +a; node ../supabase/seed-spots.cjs
global.WebSocket = global.WebSocket || class {};
const { createClient } = require('@supabase/supabase-js');

const db = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const img = (s) => `https://picsum.photos/seed/${s}/300/200`;

const SPOTS = [
  { name: "Uncle Rick's Pontoon", category: 'on water', location: 'Lake Mendota', lat: 43.1097, lng: -89.4206, image: img('pontoon7'), characteristic_ids: ['water', 'sunset', 'private', 'cannabis', 'loud', 'aux', 'byob', 'free', 'biggroup'], description: "Rick's 24-footer. Cut the engine past the point and the bay is yours." },
  { name: "Joey's Basement", category: 'basement', location: 'Near campus', lat: 43.0733, lng: -89.4009, image: img('basement4'), characteristic_ids: ['aux', 'charging', 'private', 'cannabis'] },
  { name: "Marcus's Rooftop", category: 'rooftop', location: 'Eastside', lat: 43.0738, lng: -89.4015, image: img('rooftop9'), characteristic_ids: ['charging', 'cannabis', 'view', 'aux'] },
  { name: "Nia's Firepit", category: 'backyard', location: 'Northside', lat: 43.076, lng: -89.403, image: img('firepit3'), characteristic_ids: ['loud', 'biggroup', 'dog'] },
  { name: 'The Tin Roof Patio', category: 'bar patio', location: 'Downtown', lat: 43.0731, lng: -89.4002, image: img('tinroof2'), characteristic_ids: ['food', 'aux', 'shaded', 'parking'] },
  { name: 'Cedar Bench by the Oak', category: 'park', location: 'Cedar Park', lat: 43.0735, lng: -89.4012, image: img('cedarbench8'), characteristic_ids: ['sunset', 'free', 'shaded'] },
  { name: 'The Loading Dock', category: 'lot', location: 'Warehouse district', lat: 43.0728, lng: -89.402, image: img('dock5'), characteristic_ids: ['loud', 'openlate', 'biggroup'] },
  { name: 'Riverwalk Steps', category: 'waterfront', location: 'Riverfront', lat: 43.0745, lng: -89.4012, image: img('riverwalk1'), characteristic_ids: ['water', 'free', 'sunset'] },
];

(async () => {
  const { data: a, error: aerr } = await db.auth.signInAnonymously();
  if (aerr) return console.log('AUTH ERROR:', aerr.message);
  const uid = a.user.id;
  await db.from('profiles').upsert({ id: uid, name: 'Kick It', initial: 'K' }, { onConflict: 'id', ignoreDuplicates: true });

  const { data: existing } = await db.from('spots').select('name');
  const have = new Set((existing ?? []).map((s) => s.name));

  const toInsert = SPOTS.filter((s) => !have.has(s.name)).map((s) => ({
    creator_id: uid,
    access: 'open',
    description: null,
    images: [],
    ...s,
  }));

  if (toInsert.length === 0) return console.log('Already seeded — nothing to insert.');
  const { error } = await db.from('spots').insert(toInsert);
  console.log(error ? 'INSERT ERROR: ' + error.message : `Seeded ${toInsert.length} spot(s).`);
})();
