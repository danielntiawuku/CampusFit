-- ============================================================================
-- 0003_profiles_guard
--
-- Closes a privilege-escalation hole in the row-level-security setup.
--
-- The `profiles_update_own` policy lets a signed-in user UPDATE their own row,
-- but RLS is row-scoped, not column-scoped — so a student could PATCH their own
-- `role` to 'admin' (or inflate `points`) straight through the REST API and
-- then satisfy `is_admin()` everywhere. This trigger makes the server-managed
-- columns immutable for non-admins while still allowing the harmless,
-- genuinely user-owned fields to be edited.
--
-- Owner-editable :  full_name, campus, avatar_url, interests, bio
-- Server-managed :  role, verification_status, points, level, streak_days,
--                   distance_km, active_minutes, last_active_date
-- ============================================================================

create or replace function public.guard_profile_sensitive_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Admins keep full control (also required by AdminStudents/AdminReports).
  if public.is_admin() then
    return new;
  end if;

  -- A user may create only a default-profile row for themselves.
  if tg_op = 'INSERT' then
    if new.role is distinct from 'student'
       or new.verification_status is distinct from 'unverified'
       or coalesce(new.points, 0) <> 0
       or coalesce(new.level, 1) <> 1
       or coalesce(new.streak_days, 0) <> 0 then
      raise exception
        'profiles: server-managed fields cannot be set on insert';
    end if;
    return new;
  end if;

  if new.role               is distinct from old.role
     or new.verification_status is distinct from old.verification_status
     or new.points           is distinct from old.points
     or new.level            is distinct from old.level
     or new.streak_days      is distinct from old.streak_days
     or new.distance_km      is distinct from old.distance_km
     or new.active_minutes   is distinct from old.active_minutes
     or new.last_active_date is distinct from old.last_active_date
  then
    raise exception
      'profiles: server-managed fields are read-only for non-admins';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_sensitive on public.profiles;
create trigger profiles_guard_sensitive
  before insert or update on public.profiles
  for each row execute function public.guard_profile_sensitive_fields();
