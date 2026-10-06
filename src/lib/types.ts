/** Shared domain types mirroring the Supabase schema (supabase/migrations). */

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  campus: string | null;
  avatar_url: string | null;
  interests: string[];
  points: number;
  level: number;
  streak_days: number;
  distance_km: number;
  active_minutes: number;
  verification_status: VerificationStatus;
  role: 'student' | 'admin';
  bio: string | null;
  created_at: string;
}

export type CheckpointDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface Checkpoint {
  id: string;
  code: string;
  name: string;
  description: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  difficulty: CheckpointDifficulty;
  base_points: number;
  is_active: boolean;
  created_at: string;
}

export interface CheckpointScan {
  id: string;
  user_id: string;
  checkpoint_id: string;
  points_awarded: number;
  scanned_at: string;
  checkpoint?: Pick<Checkpoint, 'name' | 'location' | 'difficulty' | 'base_points'>;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  requirement: number;
  metric: 'scans' | 'points' | 'streak' | 'distance_km' | 'checkpoints';
}

export interface UserBadge {
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface LeaderboardRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  level: number;
  rank: number;
}

export interface FitClip {
  id: string;
  user_id: string;
  caption: string;
  video_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  created_at: string;
  author?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface FitTrip {
  id: string;
  name: string;
  description: string | null;
  distance_km: number;
  difficulty: CheckpointDifficulty;
  participants_count: number;
  cover_url: string | null;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  color: string;
}

export interface ProblemReport {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  details: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

/** Dashboard headline metrics. */
export interface ActivityStats {
  /** Steps taken today. */
  steps: number;
  step_goal: number;
  /** Active minutes today (dashboard card). */
  active_minutes: number;
  active_goal: number;
  heart_rate: number;
  /** Weekly rollups (activity stats screen). */
  calories: number;
  weekly_active_minutes: number;
  distance_km: number;
}
