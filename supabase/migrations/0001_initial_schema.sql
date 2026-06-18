-- Kick It — initial schema, RLS, and Data API grants.
-- Matches the app's domain models + repository contracts (see app/src/domain, app/src/data).
--
-- Project settings assumed: Data API ON, "auto-expose new tables" OFF (so we GRANT
-- explicitly), "automatic RLS" ON (we also enable RLS explicitly for clarity).
--
-- Identity: per-user data keys off auth.uid(). The app is single-user today; create
-- one auth user and a matching `profiles` row to stand in for the current mock user.
--
-- Derived (NOT stored), matching the app:
--   * Spot.score        -> from a user's ranking position (client: scoreFromRank)
--   * Spot.vouchCounts  -> COUNT over endorsements per (spot, characteristic)
--   * Hang.likes        -> COUNT over reactions(key='heart') per hang
--   * Spot.distanceMi   -> computed from lat/lng + the viewer's location at query time

begin;

-- ---------------------------------------------------------------------------
-- Enums (mirror the TS unions)
-- ---------------------------------------------------------------------------
create type access_level   as enum ('open', 'friends', 'invite');           -- AccessLevel
create type char_category  as enum ('outdoors', 'vibe', 'features', 'access'); -- CategoryKey
create type reaction_key   as enum ('heart', 'fire', 'haha');               -- ReactionKey
create type activity_kind  as enum ('hang', 'ranked');                      -- feed kinds (new_spot lives on Explore, not the feed)

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
-- One row per user, tied to Supabase Auth. This is the app's `Member` + profile.
create table profiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  name      text not null,
  initial   text not null,
  handle    text unique,
  created_at timestamptz not null default now()
);

-- Your crew: directed edge `owner` considers `member` a crew member (friend).
create table crew_members (
  owner_id  uuid not null references profiles (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, member_id),
  check (owner_id <> member_id)
);

-- Pending join requests addressed to `owner_id` from `requester_id`.
create table crew_requests (
  owner_id     uuid not null references profiles (id) on delete cascade,
  requester_id uuid not null references profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (owner_id, requester_id),
  check (owner_id <> requester_id)
);

-- ---------------------------------------------------------------------------
-- Characteristics (fixed global catalog — the 17 traits)
-- ---------------------------------------------------------------------------
create table characteristics (
  id       text primary key,
  label    text not null,
  category char_category not null
);

-- ---------------------------------------------------------------------------
-- Spots (shared/global; created by a user)
-- ---------------------------------------------------------------------------
create table spots (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references profiles (id) on delete cascade,
  name        text not null,
  category    text not null,
  access      access_level not null,
  location    text not null default '',
  lat         double precision,
  lng         double precision,
  image       text not null default '',
  images      text[] not null default '{}',
  characteristic_ids text[] not null default '{}',
  description text,
  created_at  timestamptz not null default now()
);
create index spots_creator_idx on spots (creator_id);
create index spots_access_idx  on spots (access);

-- ---------------------------------------------------------------------------
-- Per-user collections
-- ---------------------------------------------------------------------------
-- `saved` — bookmarked "want to kick it" list.
create table saved_spots (
  user_id   uuid not null references profiles (id) on delete cascade,
  spot_id   uuid not null references spots (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

-- `mine` — the user's ranked list. `position` (0 = best) is the source of truth;
-- score is derived from position on the client. UNIQUE position keeps the order clean.
create table rankings (
  user_id   uuid not null references profiles (id) on delete cascade,
  spot_id   uuid not null references spots (id) on delete cascade,
  position  integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id),
  unique (user_id, position) deferrable initially deferred
);

-- Personal characteristic endorsements (vouchCounts = COUNT over these).
create table endorsements (
  user_id           uuid not null references profiles (id) on delete cascade,
  spot_id           uuid not null references spots (id) on delete cascade,
  characteristic_id text not null references characteristics (id),
  primary key (user_id, spot_id, characteristic_id)
);

-- Discovery filter (Preferences).
create table preferences (
  user_id         uuid primary key references profiles (id) on delete cascade,
  max_distance_mi numeric not null default 5,
  non_negotiables text[]  not null default '{}'
);

-- ---------------------------------------------------------------------------
-- Hangs (the ledger; shared/global, authored by a user)
-- ---------------------------------------------------------------------------
create table hangs (
  id         uuid primary key default gen_random_uuid(),
  spot_id    uuid not null references spots (id) on delete cascade,
  author_id  uuid not null references profiles (id) on delete cascade,
  title      text not null,
  note       text not null default '',
  image      text not null default '',
  extra_attendees integer not null default 0,
  created_at timestamptz not null default now()  -- `when` is rendered from this
);
create index hangs_spot_idx on hangs (spot_id);

-- Named attendees of a hang.
create table hang_attendees (
  hang_id   uuid not null references hangs (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  primary key (hang_id, member_id)
);

-- Per-user reactions (likes = COUNT where key='heart').
create table reactions (
  user_id uuid not null references profiles (id) on delete cascade,
  hang_id uuid not null references hangs (id) on delete cascade,
  key     reaction_key not null,
  primary key (user_id, hang_id, key)
);

-- ---------------------------------------------------------------------------
-- Activity feed (written on hang-log and first-time ranking; matches the fan-out)
-- ---------------------------------------------------------------------------
create table activity (
  id         uuid primary key default gen_random_uuid(),
  kind       activity_kind not null,
  actor_id   uuid not null references profiles (id) on delete cascade,
  spot_id    uuid not null references spots (id) on delete cascade,
  hang_id    uuid references hangs (id) on delete cascade,  -- for kind='hang'
  rank       integer,                                       -- for kind='ranked'
  created_at timestamptz not null default now()
);
create index activity_created_idx on activity (created_at desc);

-- ---------------------------------------------------------------------------
-- Visibility helper: can `viewer` see content owned by `owner` at `lvl`?
-- open -> everyone; friends/invite -> owner + owner's crew.
-- ---------------------------------------------------------------------------
create or replace function can_view(owner uuid, lvl access_level)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lvl = 'open'
    or owner = auth.uid()
    or exists (
      select 1 from crew_members c
      where c.owner_id = owner and c.member_id = auth.uid()
    );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles       enable row level security;
alter table crew_members   enable row level security;
alter table crew_requests  enable row level security;
alter table characteristics enable row level security;
alter table spots          enable row level security;
alter table saved_spots    enable row level security;
alter table rankings       enable row level security;
alter table endorsements   enable row level security;
alter table preferences    enable row level security;
alter table hangs          enable row level security;
alter table hang_attendees enable row level security;
alter table reactions      enable row level security;
alter table activity       enable row level security;

-- profiles: everyone signed-in can read (names/avatars); you edit only your own.
create policy profiles_read   on profiles for select to authenticated using (true);
create policy profiles_write  on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert on profiles for insert to authenticated with check (id = auth.uid());

-- crew + requests: you only see/manage rows where you're the owner (requests: owner or requester).
create policy crew_read   on crew_members for select to authenticated using (owner_id = auth.uid());
create policy crew_write  on crew_members for all    to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy req_read    on crew_requests for select to authenticated using (owner_id = auth.uid() or requester_id = auth.uid());
create policy req_insert  on crew_requests for insert to authenticated with check (requester_id = auth.uid());
create policy req_delete  on crew_requests for delete to authenticated using (owner_id = auth.uid());

-- characteristics: read-only catalog for everyone.
create policy chars_read on characteristics for select to anon, authenticated using (true);

-- spots: visible per access + crew; only the creator can write.
create policy spots_read   on spots for select to authenticated using (can_view(creator_id, access));
create policy spots_insert on spots for insert to authenticated with check (creator_id = auth.uid());
create policy spots_update on spots for update to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy spots_delete on spots for delete to authenticated using (creator_id = auth.uid());

-- saved / rankings / endorsements / preferences: strictly the owner's own rows.
create policy saved_all  on saved_spots  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy rank_all   on rankings     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy endorse_all on endorsements for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy prefs_all  on preferences  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- hangs: readable if the parent spot is visible; only the author writes.
create policy hangs_read   on hangs for select to authenticated
  using (exists (select 1 from spots s where s.id = spot_id and can_view(s.creator_id, s.access)));
create policy hangs_insert on hangs for insert to authenticated with check (author_id = auth.uid());
create policy hangs_update on hangs for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy hangs_delete on hangs for delete to authenticated using (author_id = auth.uid());

-- hang_attendees: readable with the hang; written by the hang's author.
create policy attendees_read on hang_attendees for select to authenticated
  using (exists (select 1 from hangs h join spots s on s.id = h.spot_id
                 where h.id = hang_id and can_view(s.creator_id, s.access)));
create policy attendees_write on hang_attendees for all to authenticated
  using (exists (select 1 from hangs h where h.id = hang_id and h.author_id = auth.uid()))
  with check (exists (select 1 from hangs h where h.id = hang_id and h.author_id = auth.uid()));

-- reactions: read if the hang is visible; you toggle only your own.
create policy reactions_read  on reactions for select to authenticated
  using (exists (select 1 from hangs h join spots s on s.id = h.spot_id
                 where h.id = hang_id and can_view(s.creator_id, s.access)));
create policy reactions_write on reactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- activity: readable if the referenced spot is visible; actor writes their own.
create policy activity_read   on activity for select to authenticated
  using (exists (select 1 from spots s where s.id = spot_id and can_view(s.creator_id, s.access)));
create policy activity_insert on activity for insert to authenticated with check (actor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Data API grants (auto-expose is OFF, so grant the roles explicitly).
-- RLS still gates every row; grants only open the table to the API roles.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on characteristics to anon, authenticated;

grant select, insert, update, delete on
  profiles, crew_members, crew_requests, spots, saved_spots, rankings,
  endorsements, preferences, hangs, hang_attendees, reactions, activity
  to authenticated;

-- ---------------------------------------------------------------------------
-- Seed the fixed characteristics catalog (must match app/src/domain/characteristics.ts)
-- ---------------------------------------------------------------------------
insert into characteristics (id, label, category) values
  ('water',    'On the water', 'outdoors'),
  ('sunset',   'Sunset views', 'outdoors'),
  ('view',     'City view',    'outdoors'),
  ('shaded',   'Shaded',       'outdoors'),
  ('cannabis', 'Cannabis ok',  'vibe'),
  ('loud',     'Loud-friendly','vibe'),
  ('byob',     'BYOB welcome', 'vibe'),
  ('private',  'Total privacy','vibe'),
  ('aux',      'Aux access',   'features'),
  ('charging', 'Charging',     'features'),
  ('wifi',     'WiFi',         'features'),
  ('bathroom', 'Bathroom',     'features'),
  ('parking',  'Parking',      'features'),
  ('free',     'Free',         'access'),
  ('food',     'Food on site', 'access'),
  ('biggroup', 'Big group ok', 'access'),
  ('dog',      'Dog friendly', 'access'),
  ('openlate', 'Open late',    'access');

commit;
