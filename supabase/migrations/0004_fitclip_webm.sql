-- ============================================================================
-- 0004_fitclip_webm
--
-- The in-app recorder (MediaRecorder) produces `video/webm` in Chrome/Firefox,
-- but the fitclip-videos bucket only allowed mp4/quicktime/x-msvideo, so every
-- upload from the app was rejected with a mime-type error. Accept webm too.
-- Idempotent: only appends the type when it is not already allowed.
-- ============================================================================
update storage.buckets
   set allowed_mime_types = array_append(coalesce(allowed_mime_types, '{}'::text[]), 'video/webm')
 where id = 'fitclip-videos'
   and not ('video/webm' = any (coalesce(allowed_mime_types, '{}'::text[])));
