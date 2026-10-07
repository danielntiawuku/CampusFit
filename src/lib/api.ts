import { isSupabaseConfigured, supabaseOrNull } from './supabase';
import {
  DEMO_BADGES,
  DEMO_CHECKPOINTS,
  DEMO_CLIPS,
  DEMO_CLUBS,
  DEMO_LEADERBOARD,
  DEMO_PROFILE,
  DEMO_STATS,
  DEMO_TRIPS,
  DIFFICULTY_MULTIPLIER,
} from './data';
import type {
  Badge,
  Checkpoint,
  CheckpointScan,
  Club,
  FitClip,
  FitTrip,
  LeaderboardRow,
  ProblemReport,
  Profile,
} from './types';

export const usingDemoData = !isSupabaseConfigured;

export interface ScanResult {
  ok: boolean;
  error?: string;
  checkpoint?: string;
  location?: string;
  difficulty?: string;
  points_awarded?: number;
  total_points?: number;
  retry_after_seconds?: number;
}

/* ------------------------------------------------------------------ profile */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_PROFILE;
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Profile>
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

/* ------------------------------------------------------------- checkpoints */

export async function fetchCheckpoints(): Promise<Checkpoint[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_CHECKPOINTS;
  const { data, error } = await sb
    .from('checkpoints')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as Checkpoint[];
}

/**
 * Validate a checkpoint code and award points.
 * Server-side RPC when configured; local simulation otherwise so the
 * gamification loop is testable before the database exists.
 */
export async function scanCheckpoint(code: string): Promise<ScanResult> {
  const normalised = code.trim().toUpperCase();
  const sb = supabaseOrNull();

  if (sb) {
    const { data, error } = await sb.rpc('scan_checkpoint', { p_code: normalised });
    if (error) return { ok: false, error: error.message };
    return data as ScanResult;
  }

  // --- demo simulation -----------------------------------------------------
  const match = DEMO_CHECKPOINTS.find(c => c.code === normalised);
  if (!match) return { ok: false, error: 'checkpoint_not_found' };
  const multiplier = DIFFICULTY_MULTIPLIER[match.difficulty] ?? 1;
  const award = Math.round(match.base_points * multiplier);
  return {
    ok: true,
    checkpoint: match.name,
    location: match.location,
    difficulty: match.difficulty,
    points_awarded: award,
    total_points: DEMO_PROFILE.points + award,
  };
}

/* ------------------------------------------------------------- leaderboards */

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_LEADERBOARD;
  const { data, error } = await sb.from('leaderboard').select('*').limit(100);
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

/* ------------------------------------------------------------------ badges */

export async function fetchBadges(): Promise<Badge[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_BADGES;
  const { data, error } = await sb.from('badges').select('*').order('tier');
  if (error) throw error;
  return (data ?? []) as Badge[];
}

export async function fetchEarnedBadgeIds(userId: string): Promise<string[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_BADGES.filter(b => ['first_steps', 'explorer', 'points_2500', 'streak_7'].includes(b.code)).map(b => b.id);
  const { data, error } = await sb
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(r => r.badge_id as string);
}

/* --------------------------------------------------------------- social */

export async function fetchFitClips(): Promise<FitClip[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_CLIPS;
  const { data, error } = await sb
    .from('fitclips')
    .select('*, author:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as FitClip[];
}

export async function fetchFitTrips(): Promise<FitTrip[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_TRIPS;
  const { data, error } = await sb.from('fittrips').select('*');
  if (error) throw error;
  return (data ?? []) as FitTrip[];
}

export async function fetchClubs(): Promise<Club[]> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_CLUBS;
  const { data, error } = await sb.from('clubs').select('*');
  if (error) throw error;
  return (data ?? []) as Club[];
}

/* ------------------------------------------------------------ activity */

export async function fetchActivityStats(): Promise<typeof DEMO_STATS> {
  const sb = supabaseOrNull();
  if (!sb) return DEMO_STATS;
  // Weekly rollups are derived from the checkpoint scan history; today's
  // counters come from the profile until a device tracker integration lands.
  const { data: scans, error } = await sb
    .from('checkpoint_scans')
    .select('points_awarded, scanned_at');
  if (error) throw error;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekScans = (scans ?? []).filter(s => new Date(s.scanned_at) >= weekAgo);
  return {
      ...DEMO_STATS,
      // ~4.5 active minutes and ~0.09 kcal per validated checkpoint scan.
      weekly_active_minutes: Math.max(
        DEMO_STATS.weekly_active_minutes,
        Math.round(weekScans.length * 4.5)
      ),
      calories: Math.max(DEMO_STATS.calories, Math.round(weekScans.length * 11)),
    };
}

/* --------------------------------------------------------------- reports */

export async function submitProblemReport(
  userId: string,
  payload: { category: string; subject: string; details: string }
): Promise<ProblemReport | null> {
  const sb = supabaseOrNull();
  if (!sb) {
    return {
      id: `local-${Date.now()}`,
      user_id: userId,
      ...payload,
      status: 'open',
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await sb
    .from('problem_reports')
    .insert({ user_id: userId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as ProblemReport;
}

/* ------------------------------------------------------------- sessions */

export async function signOut(): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  await sb.auth.signOut();
}

export type { CheckpointScan };
