-- Public 'media' bucket for user-uploaded spot/hang photos. Files live under a per-user
-- folder ({uid}/...). Anyone can read (public images in the app); only a real (non-anon)
-- signed-in user can upload into their own folder, and only manage their own files.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and public.is_real_user()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "media owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and owner = auth.uid());

create policy "media owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and owner = auth.uid());
