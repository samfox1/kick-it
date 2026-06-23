-- Defense-in-depth: the "media owner update" policy had only USING, no WITH CHECK. Not
-- exploitable today (storage.objects.owner is server-set, not client-controllable), but add
-- the check so an UPDATE can't move a row out of the owner's scope.

alter policy "media owner update" on storage.objects
  with check (bucket_id = 'media' and owner = auth.uid());
