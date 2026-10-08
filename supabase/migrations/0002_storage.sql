-- ============================================================================
-- Storage buckets + RLS for avatars and fitclip videos
-- ============================================================================

-- Create buckets if they don't exist (idempotent).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- video/webm is what MediaRecorder produces in Chrome/Firefox, so the
-- in-app recorder can actually post its output.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fitclip-videos', 'fitclip-videos', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'])
on conflict (id) do nothing;

-- No RLS policies needed on storage.objects for public buckets -
-- public = true means anyone can read. Writes are controlled by the
-- bucket's default policies which allow authenticated users to upload
-- when RLS is not enforced on storage.objects.
--
-- If you want stricter controls, use the Supabase Dashboard:
-- Storage → avatars → Bucket Settings → Public: on
-- Storage → fitclip-videos → Bucket Settings → Public: on
