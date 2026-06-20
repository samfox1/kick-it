-- Close the USING/WITH CHECK gap from 0005. DELETE policies evaluate only USING, so anonymous
-- users could still DELETE their own content rows. Add is_real_user() to USING too, and lock
-- the latent crew write policies (no client path yet, but make them anon-proof up front).
-- (hang_attendees was dropped in 0003, so there's no attendees policy to cover.)

-- Content deletes + the for-all per-user policies (USING side; WITH CHECK was done in 0005).
alter policy spots_delete    on spots        using (creator_id = auth.uid() and is_real_user());
alter policy hangs_delete    on hangs         using (author_id = auth.uid() and is_real_user());
alter policy saved_all       on saved_spots   using (user_id = auth.uid() and is_real_user());
alter policy rank_all        on rankings      using (user_id = auth.uid() and is_real_user());
alter policy endorse_all     on endorsements  using (user_id = auth.uid() and is_real_user());
alter policy reactions_write on reactions     using (user_id = auth.uid() and is_real_user());

-- Latent crew policies (crew is deferred; lock writes before any path ships).
alter policy crew_write on crew_members
  using (owner_id = auth.uid() and is_real_user())
  with check (owner_id = auth.uid() and is_real_user());
alter policy req_insert on crew_requests with check (requester_id = auth.uid() and is_real_user());
alter policy req_delete on crew_requests using (owner_id = auth.uid() and is_real_user());
