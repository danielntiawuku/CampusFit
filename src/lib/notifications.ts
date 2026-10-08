import {
  fetchBadges,
  fetchClubs,
  fetchEarnedBadgeIds,
  fetchLeaderboard,
  fetchProfile,
  fetchClubMembership,
} from './api';

/**
 * Notifications derived from REAL Supabase data (badges you actually earned,
 * your actual weekly rank, your points/streak, clubs you actually joined).
 * There is no notifications table — content is computed client-side so every
 * line shown to the student traces back to live rows.
 */
export interface AppNotice {
  id: string;
  icon: string;
  tone: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const READ_KEY = 'campusfit.read-notices';

export function readNoticeIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markNoticeRead(id: string): void {
  const ids = new Set(readNoticeIds());
  ids.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export function markAllNoticesRead(ids: string[]): void {
  localStorage.setItem(READ_KEY, JSON.stringify([...new Set(ids)]));
}

/** Build the notice list from live data. Falls back to an empty list. */
export async function fetchNotices(userId: string | null): Promise<AppNotice[]> {
  const read = new Set(readNoticeIds());
  const now = new Date();

  const [profile, badges, earned, board, memberOf] = await Promise.all([
    userId ? fetchProfile(userId) : Promise.resolve(null),
    fetchBadges().catch(() => []),
    userId ? fetchEarnedBadgeIds(userId).catch((): string[] => []) : Promise.resolve([] as string[]),
    fetchLeaderboard().catch(() => []),
    userId ? fetchClubMembership(userId).catch((): string[] => []) : Promise.resolve([] as string[]),
  ]);

  const notices: AppNotice[] = [];

  // 1. Most recent badge we can match to an earned id.
  const earnedBadge = badges.find((b) => earned.includes(b.id));
  if (earnedBadge) {
    notices.push({
      id: `badge-${earnedBadge.id}`,
      icon: 'military_medal',
      tone: 'bg-tertiary-container/20 text-on-tertiary-container',
      title: `Badge earned: ${earnedBadge.name}`,
      body: earnedBadge.description ?? `You unlocked the ${earnedBadge.name} badge.`,
      time: 'Recently',
      unread: !read.has(`badge-${earnedBadge.id}`),
    });
  }

  // 2. Live weekly rank.
  const row = profile ? board.find((r) => r.user_id === profile.id) : undefined;
  if (row) {
    notices.push({
      id: 'rank-weekly',
      icon: 'leaderboard',
      tone: 'bg-primary-container/20 text-primary',
      title: `You are #${row.rank} on the weekly leaderboard`,
      body: `${row.points} points at level ${row.level} — keep scanning checkpoints to climb.`,
      time: 'This week',
      unread: !read.has('rank-weekly'),
    });
  }

  // 3. Points / streak milestone from the live profile rollup.
  if (profile && profile.points > 0) {
    notices.push({
      id: `streak-${profile.streak_days}-points-${profile.points}`,
      icon: 'bar_chart',
      tone: 'bg-primary-container/20 text-primary',
      title: profile.streak_days > 0 ? `${profile.streak_days}-day streak alive` : 'Points banked',
      body: `You have ${profile.points} points across ${profile.distance_km.toFixed(1)} km and ${profile.active_minutes} active minutes.`,
      time: 'From your activity',
      unread: !read.has(`streak-${profile.streak_days}-points-${profile.points}`),
    });
  }

  // 4. Club you belong to.
  if (memberOf.length > 0) {
    const clubs = await fetchClubs().catch(() => []);
    const mine = clubs.filter((c) => memberOf.includes(c.id));
    for (const club of mine.slice(0, 1)) {
      notices.push({
        id: `club-${club.id}`,
        icon: 'groups',
        tone: 'bg-surface-container-low text-on-surface-variant',
        title: `Club update — ${club.name}`,
        body: club.description ?? `${club.member_count} members are active in ${club.name}.`,
        time: 'Your club',
        unread: !read.has(`club-${club.id}`),
      });
    }
  }

  // 5. Welcome for brand-new accounts.
  if (notices.length === 0) {
    const joined = profile ? new Date(profile.created_at) : null;
    notices.push({
      id: 'welcome',
      icon: 'waving_hand',
      tone: 'bg-primary-container/20 text-primary',
      title: 'Welcome to CampusFit',
      body: joined && now.getTime() - joined.getTime() < 7 * 864e5
        ? 'Your account is live — scan your first checkpoint to start earning points.'
        : 'Scan checkpoints around campus to earn points, badges and weekly rank.',
      time: 'Getting started',
      unread: !read.has('welcome'),
    });
  }

  return notices;
}
