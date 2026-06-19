-- Rewrite the current user's ranked list in a single transaction. Delete-then-insert
-- avoids the unique(user_id, position) shuffle problem that row-by-row updates hit over
-- PostgREST (one tx per request). SECURITY INVOKER (default) — RLS still applies, and the
-- rankings RLS policy already restricts rows to user_id = auth.uid().

create or replace function set_rankings(p_spot_ids uuid[])
returns void
language plpgsql
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from rankings where user_id = uid;

  if array_length(p_spot_ids, 1) is null then
    return;
  end if;

  insert into rankings (user_id, spot_id, position)
  select uid, t.spot_id, t.ord - 1
  from unnest(p_spot_ids) with ordinality as t(spot_id, ord);
end;
$$;

grant execute on function set_rankings(uuid[]) to authenticated;
