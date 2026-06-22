-- Creator-only spot deletion, allowed ONLY if no one else has engaged. Spots are communal and
-- delete cascades (hangs/rankings/saved/endorsements/activity), so a blanket delete would wipe
-- other users' data. This guards against that: you can delete your spot only while it's still
-- untouched by others (e.g. a mistake/duplicate). SECURITY DEFINER because the engagement check
-- must read other users' rankings/saved rows, which per-user RLS would otherwise hide.

create or replace function delete_own_spot(p_spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  owner uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select creator_id into owner from spots where id = p_spot_id;
  if owner is null then
    raise exception 'SPOT_NOT_FOUND';
  end if;
  if owner <> uid then
    raise exception 'NOT_OWNER';
  end if;

  -- Block if anyone OTHER than the creator has hung out here, ranked it, or saved it.
  if exists (select 1 from hangs       where spot_id = p_spot_id and author_id <> uid)
     or exists (select 1 from rankings    where spot_id = p_spot_id and user_id <> uid)
     or exists (select 1 from saved_spots where spot_id = p_spot_id and user_id <> uid) then
    raise exception 'SPOT_HAS_ENGAGEMENT';
  end if;

  -- Safe: cascades remove only the creator's own dependent rows.
  delete from spots where id = p_spot_id;
end;
$$;

grant execute on function delete_own_spot(uuid) to authenticated;
