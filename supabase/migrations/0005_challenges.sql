-- ============================================================================
-- 0005_challenges
--
-- The app shipped challenge *cards* in the club dashboard, but there was no
-- data behind them: nothing to create, nothing to open, nothing persisted.
-- Add a challenges table so "New Challenge" produces a real row, the list on
-- /challenges reads real rows, and each challenge has a detail page.
-- ============================================================================

create table if not exists public.challenges (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid references public.clubs(id) on delete set null,
  title         text not null,
  description   text not null default '',
  metric        text not null default 'scans'
                check (metric in ('scans', 'points', 'distance_km', 'checkpoints')),
  target_value  integer not null default 10 check (target_value > 0),
  points_reward integer not null default 100 check (points_reward >= 0),
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz not null default now() + interval '7 days',
  created_by    uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create index if not exists challenges_club_idx
  on public.challenges (club_id, starts_at desc);
create index if not exists challenges_ends_idx
  on public.challenges (ends_at);

alter table public.challenges enable row level security;

-- Anyone signed in can read challenges; the author (or an admin) manages theirs.
drop policy if exists "challenges_read"        on public.challenges;
drop policy if exists "challenges_insert_own"  on public.challenges;
drop policy if exists "challenges_delete_own"  on public.challenges;
drop policy if exists "challenges_admin_all"   on public.challenges;

create policy "challenges_read" on public.challenges
  for select using (auth.uid() is not null);
create policy "challenges_insert_own" on public.challenges
  for insert with check (auth.uid() = created_by or public.is_admin());
create policy "challenges_delete_own" on public.challenges
  for delete using (auth.uid() = created_by or public.is_admin());
create policy "challenges_admin_all" on public.challenges
  for update using (public.is_admin()) with check (public.is_admin());
