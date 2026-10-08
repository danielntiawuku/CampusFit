-- ============================================================================
-- 0006_storage_policies
--
-- `storage.objects` has row level security ENABLED and this project had ZERO
-- policies on it, so every upload from the app (avatars and FitClip videos)
-- failed with:
--
--     403 new row violates row-level security policy
--
-- The bucket comment in 0002_storage.sql assumed "default policies allow
-- authenticated users to upload" — they do not exist. Add folder-scoped
-- policies: a signed-in user may only write inside their own top-level folder
-- (the app writes `<user id>/<timestamp>.<ext>`), and anyone may read because
-- both buckets are public.
-- ============================================================================

do $$
begin
  -- read (both buckets are public)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'campusfit_objects_read'
  ) then
    execute $p$
      create policy "campusfit_objects_read" on storage.objects
        for select
        using (bucket_id in ('avatars', 'fitclip-videos'));
    $p$;
  end if;

  -- insert: own folder only
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'campusfit_objects_insert'
  ) then
    execute $p$
      create policy "campusfit_objects_insert" on storage.objects
        for insert to authenticated
        with check (
          bucket_id in ('avatars', 'fitclip-videos')
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        );
    $p$;
  end if;

  -- update: own folder only
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'campusfit_objects_update'
  ) then
    execute $p$
      create policy "campusfit_objects_update" on storage.objects
        for update to authenticated
        using (
          bucket_id in ('avatars', 'fitclip-videos')
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        )
        with check (
          bucket_id in ('avatars', 'fitclip-videos')
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        );
    $p$;
  end if;

  -- delete: own folder only
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'campusfit_objects_delete'
  ) then
    execute $p$
      create policy "campusfit_objects_delete" on storage.objects
        for delete to authenticated
        using (
          bucket_id in ('avatars', 'fitclip-videos')
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        );
    $p$;
  end if;
end $$;
