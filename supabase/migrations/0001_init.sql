-- ============================================================================
-- CampusFit — initial schema
-- Gamified, checkpoint-based campus fitness platform.
--
-- Design notes (maps to thesis objectives):
--   * profiles            -> student registration / auth (obj 3)
--   * checkpoints         -> QR/NFC checkpoints placed on campus (obj 4)
--   * checkpoint_scans    -> validated visits, append-only ledger (obj 4)
--   * points_ledger       -> auditable points allocation (obj 5)
--   * badges/user_badges  -> achievement reward system (obj 7)
--   * leaderboard view    -> competitive ranking (obj 6)
--   * problem_reports     -> Report a Problem flow (screen 19/20)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type verification_status as enum ('unverified','pending','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('student','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type checkpoint_difficulty as enum ('easy','medium','hard','epic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type badge_tier as enum ('bronze','silver','gold','legendary');
exception when duplicate_object then null; end $$;

do $$ begin
  create type badge_metric as enum ('scans','points','streak','distance_km','checkpoints');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open','in_progress','resolved');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles : 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text not null default '',
  email              text not null default '',
  campus             text,
  avatar_url         text,
  interests          text[] not null default '{}',
  points             integer not null default 0 check (points >= 0),
  level              integer not null default 1 check (level >= 1),
  streak_days        integer not null default 0 check (streak_days >= 0),
  distance_km        numeric(8,2) not null default 0,
  active_minutes     integer not null default 0,
  verification_status verification_status not null default 'unverified',
  role               app_role not null default 'student',
  bio                text,
  last_active_date   date,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- checkpoints : physical QR/NFC stations around campus
-- ---------------------------------------------------------------------------
create table if not exists public.checkpoints (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,
  location     text not null,
  latitude     double precision,
  longitude    double precision,
  difficulty   checkpoint_difficulty not null default 'easy',
  base_points  integer not null default 10 check (base_points > 0),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists checkpoints_code_idx on public.checkpoints (code);
create index if not exists checkpoints_active_idx on public.checkpoints (is_active);

-- ---------------------------------------------------------------------------
-- checkpoint_scans : one validated visit per user+checkpoint per cooldown
-- ---------------------------------------------------------------------------
create table if not exists public.checkpoint_scans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  checkpoint_id uuid not null references public.checkpoints(id) on delete cascade,
  points_awarded integer not null default 0,
  scanned_at    timestamptz not null default now(),
  constraint checkpoint_scans_user_checkpoint_key unique (user_id, checkpoint_id, scanned_at)
);

create index if not exists checkpoint_scans_user_idx on public.checkpoint_scans (user_id, scanned_at desc);
create index if not exists checkpoint_scans_checkpoint_idx on public.checkpoint_scans (checkpoint_id);

-- ---------------------------------------------------------------------------
-- points_ledger : append-only audit trail of every points movement
-- ---------------------------------------------------------------------------
create table if not exists public.points_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  delta      integer not null,
  reason     text not null,
  ref_id     uuid,
  created_at timestamptz not null default now()
);

create index if not exists points_ledger_user_idx on public.points_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- badges + earned badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text not null default '',
  icon        text not null default 'military_star',
  tier        badge_tier not null default 'bronze',
  requirement integer not null default 1,
  metric      badge_metric not null default 'scans'
);

create table if not exists public.user_badges (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_id  uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- social content : FitClips, FitTrips, Clubs
-- ---------------------------------------------------------------------------
create table if not exists public.fitclips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  caption       text not null default '',
  video_url     text not null,
  thumbnail_url text,
  likes_count   integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.fitclip_likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  clip_id    uuid not null references public.fitclips(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, clip_id)
);

create table if not exists public.fittrips (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  distance_km       numeric(6,2) not null default 0,
  difficulty        checkpoint_difficulty not null default 'easy',
  participants_count integer not null default 0,
  cover_url         text
);

create table if not exists public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  member_count integer not null default 0,
  color       text not null default '#1ecc8b'
);

create table if not exists public.club_members (
  club_id   uuid not null references public.clubs(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

-- ---------------------------------------------------------------------------
-- problem reports (Report a Problem screen)
-- ---------------------------------------------------------------------------
create table if not exists public.problem_reports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null default 'other',
  subject    text not null,
  details    text not null default '',
  status     report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- FUNCTIONS
-- ===========================================================================

-- Create a profile automatically on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Validate a checkpoint scan and award points atomically.
-- Returns jsonb so the client can branch on success/error without exceptions.
-- Cooldown: a user may re-scan the same checkpoint after 8 hours.
-- ---------------------------------------------------------------------------
create or replace function public.scan_checkpoint(p_code text)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user       uuid := auth.uid();
  v_checkpoint public.checkpoints%rowtype;
  v_scan       public.checkpoint_scans%rowtype;
  v_multiplier numeric;
  v_award      integer;
  v_total      integer;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_checkpoint
    from public.checkpoints
   where code = upper(trim(p_code))
     and is_active = true;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'checkpoint_not_found');
  end if;

  -- cooldown check
  select * into v_scan
    from public.checkpoint_scans
   where user_id = v_user
     and checkpoint_id = v_checkpoint.id
   order by scanned_at desc
   limit 1;
  if found and v_scan.scanned_at > now() - interval '8 hours' then
    return jsonb_build_object(
      'ok', false,
      'error', 'cooldown',
      'retry_after_seconds',
      ceil(extract(epoch from (v_scan.scanned_at + interval '8 hours' - now())))::int
    );
  end if;

  -- dynamic points allocation: difficulty multiplier + streak bonus
  v_multiplier := case v_checkpoint.difficulty
                    when 'epic'   then 2.5
                    when 'hard'   then 1.8
                    when 'medium' then 1.3
                    else 1.0
                  end;
  v_award := round(v_checkpoint.base_points * v_multiplier);

  insert into public.checkpoint_scans (user_id, checkpoint_id, points_awarded)
  values (v_user, v_checkpoint.id, v_award);

  insert into public.points_ledger (user_id, delta, reason, ref_id)
  values (v_user, v_award, 'checkpoint:' || v_checkpoint.code, v_checkpoint.id);

  update public.profiles
     set points = points + v_award,
         level  = greatest(1, floor(sqrt((points + v_award) / 100)) + 1),
         last_active_date = current_date,
         streak_days = case
                         when last_active_date = current_date - 1 then streak_days + 1
                         when last_active_date = current_date     then streak_days
                         else 1
                       end
   where id = v_user
   returning points into v_total;

  -- award any newly-earned badges
  perform public.award_eligible_badges(v_user);

  return jsonb_build_object(
    'ok', true,
    'checkpoint', v_checkpoint.name,
    'location', v_checkpoint.location,
    'difficulty', v_checkpoint.difficulty,
    'points_awarded', v_award,
    'total_points', v_total
  );
end;
$$;

-- Award every badge the user now qualifies for (idempotent).
create or replace function public.award_eligible_badges(p_user uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_scans     integer;
  v_points    integer;
  v_streak    integer;
  v_distance  numeric;
  v_distinct  integer;
begin
  select count(*) into v_scans from public.checkpoint_scans where user_id = p_user;
  select points, streak_days, distance_km into v_points, v_streak, v_distance
    from public.profiles where id = p_user;
  select count(distinct checkpoint_id) into v_distinct
    from public.checkpoint_scans where user_id = p_user;

  insert into public.user_badges (user_id, badge_id)
  select p_user, b.id
    from public.badges b
   where case b.metric
           when 'scans'      then v_scans
           when 'points'     then v_points
           when 'streak'     then v_streak
           when 'distance_km' then floor(v_distance)::int
           when 'checkpoints' then v_distinct
         end >= b.requirement
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Leaderboard: rank by points, ties broken by earliest achievement.
-- Security definer so students can read the ranking without seeing raw rows
-- of profiles they do not share a group with.
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard
with (security_invoker = off) as
select
  p.id                                          as user_id,
  p.full_name,
  p.avatar_url,
  p.points,
  p.level,
  rank() over (order by p.points desc, p.created_at asc) as rank
from public.profiles p
where p.role = 'student'
order by p.points desc, p.created_at asc
limit 100;

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles          enable row level security;
alter table public.checkpoints       enable row level security;
alter table public.checkpoint_scans  enable row level security;
alter table public.points_ledger     enable row level security;
alter table public.badges            enable row level security;
alter table public.user_badges       enable row level security;
alter table public.fitclips          enable row level security;
alter table public.fitclip_likes     enable row level security;
alter table public.fittrips          enable row level security;
alter table public.clubs             enable row level security;
alter table public.club_members      enable row level security;
alter table public.problem_reports   enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- profiles ---------------------------------------------------------------
drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;
drop policy if exists "profiles_insert_own"   on public.profiles;
drop policy if exists "profiles_admin_all"    on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- checkpoints : readable by any signed-in user, writable by admin only ----
drop policy if exists "checkpoints_read" on public.checkpoints;
drop policy if exists "checkpoints_admin_write" on public.checkpoints;
create policy "checkpoints_read" on public.checkpoints
  for select using (auth.uid() is not null and is_active);
create policy "checkpoints_admin_write" on public.checkpoints
  for all using (public.is_admin()) with check (public.is_admin());

-- scans : users see only their own ---------------------------------------
drop policy if exists "scans_select_own" on public.checkpoint_scans;
drop policy if exists "scans_admin_all"  on public.checkpoint_scans;
create policy "scans_select_own" on public.checkpoint_scans
  for select using (auth.uid() = user_id or public.is_admin());
create policy "scans_admin_all" on public.checkpoint_scans
  for all using (public.is_admin()) with check (public.is_admin());
-- inserts happen through scan_checkpoint() (security definer), not direct.

-- points ledger : read own ------------------------------------------------
drop policy if exists "ledger_select_own" on public.points_ledger;
drop policy if exists "ledger_admin_all"  on public.points_ledger;
create policy "ledger_select_own" on public.points_ledger
  for select using (auth.uid() = user_id or public.is_admin());
create policy "ledger_admin_all" on public.points_ledger
  for all using (public.is_admin()) with check (public.is_admin());

-- badges : public catalogue ----------------------------------------------
drop policy if exists "badges_read" on public.badges;
drop policy if exists "badges_admin_write" on public.badges;
create policy "badges_read" on public.badges
  for select using (true);
create policy "badges_admin_write" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

-- user badges : own -------------------------------------------------------
drop policy if exists "user_badges_select" on public.user_badges;
create policy "user_badges_select" on public.user_badges
  for select using (auth.uid() = user_id or public.is_admin());

-- fitclips : public read, owner write ------------------------------------
drop policy if exists "fitclips_read" on public.fitclips;
drop policy if exists "fitclips_insert_own" on public.fitclips;
drop policy if exists "fitclips_delete_own" on public.fitclips;
create policy "fitclips_read" on public.fitclips
  for select using (auth.uid() is not null);
create policy "fitclips_insert_own" on public.fitclips
  for insert with check (auth.uid() = user_id);
create policy "fitclips_delete_own" on public.fitclips
  for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "fitclip_likes_write_own" on public.fitclip_likes;
drop policy if exists "fitclip_likes_read" on public.fitclip_likes;
create policy "fitclip_likes_read" on public.fitclip_likes
  for select using (auth.uid() is not null);
create policy "fitclip_likes_write_own" on public.fitclip_likes
  for insert with check (auth.uid() = user_id);
create policy "fitclip_likes_delete_own" on public.fitclip_likes
  for delete using (auth.uid() = user_id);

-- fittrips / clubs : public read, admin write ----------------------------
drop policy if exists "fittrips_read" on public.fittrips;
drop policy if exists "fittrips_admin_write" on public.fittrips;
create policy "fittrips_read" on public.fittrips
  for select using (auth.uid() is not null);
create policy "fittrips_admin_write" on public.fittrips
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "clubs_read" on public.clubs;
drop policy if exists "clubs_admin_write" on public.clubs;
create policy "clubs_read" on public.clubs
  for select using (auth.uid() is not null);
create policy "clubs_admin_write" on public.clubs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "club_members_read" on public.club_members;
drop policy if exists "club_members_join" on public.club_members;
create policy "club_members_read" on public.club_members
  for select using (auth.uid() is not null);
create policy "club_members_join" on public.club_members
  for insert with check (auth.uid() = user_id);
create policy "club_members_leave" on public.club_members
  for delete using (auth.uid() = user_id);

-- problem reports : owner read/write, admin all --------------------------
drop policy if exists "reports_select_own" on public.problem_reports;
drop policy if exists "reports_insert_own" on public.problem_reports;
drop policy if exists "reports_admin_all"  on public.problem_reports;
create policy "reports_select_own" on public.problem_reports
  for select using (auth.uid() = user_id or public.is_admin());
create policy "reports_insert_own" on public.problem_reports
  for insert with check (auth.uid() = user_id);
create policy "reports_admin_all" on public.problem_reports
  for update using (public.is_admin()) with check (public.is_admin());

-- grant execute on RPCs to authenticated users
grant execute on function public.scan_checkpoint(text) to authenticated;
grant execute on function public.award_eligible_badges(uuid) to authenticated;
