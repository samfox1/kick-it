-- Defense in depth: block anonymous (guest) sessions from writing content at the database,
-- not just in the UI. Browsing stays open. Profiles + preferences remain writable by guests
-- (needed for the anonymous launch bootstrap and browse filters) — only content writes are
-- restricted: spots, hangs, rankings, saved_spots, endorsements, reactions, activity.

create or replace function is_real_user()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
$$;

grant execute on function is_real_user() to authenticated;

-- Re-scope each content write policy's WITH CHECK to also require a non-anonymous user.
alter policy spots_insert    on spots        with check (creator_id = auth.uid() and is_real_user());
alter policy spots_update    on spots        with check (creator_id = auth.uid() and is_real_user());
alter policy hangs_insert    on hangs         with check (author_id = auth.uid() and is_real_user());
alter policy hangs_update    on hangs         with check (author_id = auth.uid() and is_real_user());
alter policy activity_insert on activity      with check (actor_id = auth.uid() and is_real_user());
alter policy rank_all        on rankings      with check (user_id = auth.uid() and is_real_user());
alter policy saved_all       on saved_spots   with check (user_id = auth.uid() and is_real_user());
alter policy endorse_all     on endorsements  with check (user_id = auth.uid() and is_real_user());
alter policy reactions_write on reactions     with check (user_id = auth.uid() and is_real_user());
