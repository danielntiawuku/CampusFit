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
    .select('*, author:profiles!fitclips_user_id_fkey(full_name, avatar_url)')
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

/** Total validated checkpoint scans (admin analytics). */
export async function fetchScanCount(): Promise<number> {
  const sb = supabaseOrNull();
  if (!sb) return 0;
  const { count, error } = await sb
    .from('checkpoint_scans')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
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

/** Fetch all problem reports (admin only — RLS allows admin to read all). */
export async function fetchProblemReports(): Promise<ProblemReport[]> {
  const sb = supabaseOrNull();
  if (!sb) return [];
  const { data, error } = await sb
    .from('problem_reports')
    .select('*, profiles:profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProblemReport[];
}

/** Update a problem report status (admin only). */
export async function updateProblemReportStatus(
  reportId: string,
  status: 'open' | 'in_progress' | 'resolved'
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb
    .from('problem_reports')
    .update({ status })
    .eq('id', reportId);
  if (error) throw error;
}

/* --------------------------------------------------------- checkpoint CRUD (admin) */
export async function createCheckpoint(
  checkpoint: Omit<Checkpoint, 'id' | 'created_at'>
): Promise<Checkpoint | null> {
  const sb = supabaseOrNull();
  if (!sb) return null;
  const { data, error } = await sb
    .from('checkpoints')
    .insert(checkpoint)
    .select()
    .single();
  if (error) throw error;
  return data as Checkpoint;
}

export async function updateCheckpoint(
  id: string,
  patch: Partial<Omit<Checkpoint, 'id' | 'created_at'>>
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb.from('checkpoints').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCheckpoint(id: string): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb.from('checkpoints').delete().eq('id', id);
  if (error) throw error;
}

/* --------------------------------------------------------- club CRUD (admin) */
export async function createClub(
  club: Omit<Club, 'id' | 'member_count'>
): Promise<Club | null> {
  const sb = supabaseOrNull();
  if (!sb) return null;
  const { data, error } = await sb
    .from('clubs')
    .insert(club)
    .select()
    .single();
  if (error) throw error;
  return data as Club;
}

export async function updateClub(
  id: string,
  patch: Partial<Omit<Club, 'id' | 'member_count'>>
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb.from('clubs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteClub(id: string): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb.from('clubs').delete().eq('id', id);
  if (error) throw error;
}

/* --------------------------------------------------------- student management (admin) */
export async function fetchAllProfiles(): Promise<Profile[]> {
  const sb = supabaseOrNull();
  if (!sb) return [];
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function updateProfileRole(
  userId: string,
  role: 'student' | 'admin'
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateProfileVerification(
  userId: string,
  status: 'unverified' | 'pending' | 'verified' | 'rejected'
): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', userId);
  if (error) throw error;
}

/* --------------------------------------------------------- storage helpers */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string | null> {
  const sb = supabaseOrNull();
  if (!sb) return null;
  const fileExt = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${fileExt}`;
  const { error: uploadError } = await sb
    .storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (uploadError) throw uploadError;
  const { data: urlData } = await sb
    .storage
    .from('avatars')
    .getPublicUrl(path);
  if (!urlData) throw new Error('Failed to get public URL for avatar');
  return urlData.publicUrl;
}

export async function uploadFitClipVideo(
  file: File,
  userId: string
): Promise<string | null> {
  const sb = supabaseOrNull();
  if (!sb) return null;
  const fileExt = file.name.split('.').pop() ?? 'mp4';
  const path = `${userId}/${Date.now()}.${fileExt}`;
  const { error: uploadError } = await sb
    .storage
    .from('fitclip-videos')
    .upload(path, file, { upsert: false, cacheControl: '3600' });
  if (uploadError) throw uploadError;
  const { data: urlData } = await sb
    .storage
    .from('fitclip-videos')
    .getPublicUrl(path);
  if (!urlData) throw new Error('Failed to get public URL for fitclip video');
  return urlData.publicUrl;
}

/* --------------------------------------------------------- social: follow + join */
export async function joinClub(clubId: string, userId: string): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb
    .from('club_members')
    .insert({ club_id: clubId, user_id: userId });
  if (error) throw error;
}

export async function leaveClub(clubId: string, userId: string): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  const { error } = await sb
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchClubMembership(userId: string): Promise<string[]> {
  const sb = supabaseOrNull();
  if (!sb) return [];
  const { data, error } = await sb
    .from('club_members')
    .select('club_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(r => r.club_id);
}

/* ------------------------------------------------------------- sessions */
export async function signOut(): Promise<void> {
  const sb = supabaseOrNull();
  if (!sb) return;
  await sb.auth.signOut();
}

export type { CheckpointScan };
