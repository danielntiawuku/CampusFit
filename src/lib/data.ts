/**
 * Centralized demo data — single source of truth for the entire app.
 * Every screen reads from here so names, clubs, numbers are coherent.
 */

import type {
  ActivityStats,
  Badge,
  Checkpoint,
  Club,
  FitClip,
  FitTrip,
  LeaderboardRow,
  Profile,
} from './types';

/* ------------------------------------------------------------------ Profile */
export const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  full_name: 'Ama Mensah',
  email: 'ama.mensah@campus.edu.gh',
  campus: 'University of Ghana, Legon',
  avatar_url: null,
  interests: ['Running', 'Yoga', 'Cycling'],
  points: 2740,
  level: 6,
  streak_days: 12,
  distance_km: 48.6,
  active_minutes: 312,
  verification_status: 'verified',
  role: 'student',
  bio: 'Second-year Computer Science. Chasing checkpoints before lectures.',
  created_at: new Date().toISOString(),
};

/* ----------------------------------------------------------------- Activity */
export const DEMO_STATS: ActivityStats = {
  steps: 7420,
  step_goal: 10000,
  active_minutes: 52,
  active_goal: 60,
  heart_rate: 72,
  calories: 1240,
  weekly_active_minutes: 342,
  distance_km: 5.4,
};

/* ------------------------------------------------------------ Checkpoints */
export const DEMO_CHECKPOINTS: Checkpoint[] = [
  { id: 'LIB-A1', code: 'LIB-A1', name: 'Main Library Steps', description: 'Climb the front steps of the main library.', location: 'University Library', latitude: 5.6116, longitude: -0.1848, difficulty: 'easy', base_points: 10, is_active: true, created_at: '' },
  { id: 'GYM-ENT', code: 'GYM-ENT', name: 'Recreation Centre Door', description: 'Enter the student recreation centre.', location: 'Student Rec Centre', latitude: 5.6109, longitude: -0.1861, difficulty: 'easy', base_points: 12, is_active: true, created_at: '' },
  { id: 'QUAD-N', code: 'QUAD-N', name: 'North Quad Lawn', description: 'Cross the north quad lawn.', location: 'North Quadrangle', latitude: 5.6124, longitude: -0.1839, difficulty: 'easy', base_points: 10, is_active: true, created_at: '' },
  { id: 'CAF-E', code: 'CAF-E', name: 'Cafeteria Terrace', description: 'Take the terrace steps by the cafeteria.', location: 'Main Cafeteria', latitude: 5.6118, longitude: -0.1870, difficulty: 'easy', base_points: 12, is_active: true, created_at: '' },
  { id: 'UNI-CEN', code: 'UNI-CEN', name: 'University Centre Atrium', description: 'Through the main atrium.', location: 'University Centre', latitude: 5.6121, longitude: -0.1846, difficulty: 'easy', base_points: 10, is_active: true, created_at: '' },
  { id: 'STAD-1', code: 'STAD-1', name: 'Stadium Bends', description: 'Run the stadium stairway.', location: 'Sports Stadium', latitude: 5.6101, longitude: -0.1872, difficulty: 'medium', base_points: 18, is_active: true, created_at: '' },
  { id: 'SCI-BK', code: 'SCI-BK', name: 'Science Block Rear', description: 'Walk the path behind the science block.', location: 'Science Block', latitude: 5.6131, longitude: -0.1855, difficulty: 'medium', base_points: 18, is_active: true, created_at: '' },
  { id: 'ENG-BR', code: 'ENG-BR', name: 'Engineering Bridge', description: 'Cross the engineering footbridge.', location: 'Engineering Bridge', latitude: 5.6138, longitude: -0.1866, difficulty: 'medium', base_points: 20, is_active: true, created_at: '' },
  { id: 'MED-C', code: 'MED-C', name: 'Medical Centre Ramp', description: 'Around the medical centre ramp.', location: 'Campus Medical Centre', latitude: 5.6105, longitude: -0.1840, difficulty: 'easy', base_points: 10, is_active: true, created_at: '' },
  { id: 'POOL-D', code: 'POOL-D', name: 'Aquatics Deck', description: 'Out to the pool deck and back.', location: 'Aquatics Centre', latitude: 5.6098, longitude: -0.1858, difficulty: 'medium', base_points: 18, is_active: true, created_at: '' },
  { id: 'BUS-Y', code: 'BUS-Y', name: 'Bus Yard Turn', description: 'The far corner by the bus yard.', location: 'Transport Yard', latitude: 5.6092, longitude: -0.1869, difficulty: 'hard', base_points: 26, is_active: true, created_at: '' },
  { id: 'BOT-G', code: 'BOT-G', name: 'Botanic Garden Gate', description: 'Through the botanic garden gate.', location: 'Botanic Garden', latitude: 5.6151, longitude: -0.1831, difficulty: 'hard', base_points: 26, is_active: true, created_at: '' },
  { id: 'HALL-A', code: 'HALL-A', name: 'Hall A Courtyard', description: 'Cut through the Hall A courtyard.', location: 'Hall A', latitude: 5.6112, longitude: -0.1834, difficulty: 'easy', base_points: 10, is_active: true, created_at: '' },
  { id: 'HILL-T', code: 'HILL-T', name: 'Observatory Hill', description: 'The long climb up to the observatory.', location: 'Observatory Hill', latitude: 5.6094, longitude: -0.1829, difficulty: 'hard', base_points: 28, is_active: true, created_at: '' },
  { id: 'DORM-W', code: 'DORM-W', name: 'West Residence Block', description: 'Up the west residence stairs.', location: 'West Residences', latitude: 5.6147, longitude: -0.1877, difficulty: 'medium', base_points: 18, is_active: true, created_at: '' },
  { id: 'PERF-T', code: 'PERF-T', name: 'Performing Arts Steps', description: 'The front flight at performing arts.', location: 'Performing Arts Theatre', latitude: 5.6135, longitude: -0.1874, difficulty: 'medium', base_points: 18, is_active: true, created_at: '' },
  { id: 'FIELD-S', code: 'FIELD-S', name: 'South Playing Fields', description: 'Down to the south playing fields.', location: 'South Fields', latitude: 5.6083, longitude: -0.1877, difficulty: 'hard', base_points: 25, is_active: true, created_at: '' },
  { id: 'LAKE-LP', code: 'LAKE-LP', name: 'Lake Loop Pier', description: 'Full loop out to the lake pier.', location: 'Campus Lake', latitude: 5.6087, longitude: -0.1885, difficulty: 'epic', base_points: 35, is_active: true, created_at: '' },
  { id: 'RIDGE-W', code: 'RIDGE-W', name: 'Western Ridge Trail', description: 'Along the western ridge trail.', location: 'Western Ridge', latitude: 5.6155, longitude: -0.1859, difficulty: 'epic', base_points: 40, is_active: true, created_at: '' },
  { id: 'ART-DOM', code: 'ART-DOM', name: 'Arts Dome', description: 'Reach the arts district dome.', location: 'Arts Dome', latitude: 5.6142, longitude: -0.1842, difficulty: 'hard', base_points: 25, is_active: true, created_at: '' },
];

/* ----------------------------------------------------------------- Badges */
export const DEMO_BADGES: Badge[] = [
  { id: 'b1', code: 'first_steps', name: 'First Steps', description: 'Scan your very first checkpoint.', icon: 'directions_walk', tier: 'bronze', requirement: 1, metric: 'scans' },
  { id: 'b2', code: 'explorer', name: 'Campus Explorer', description: 'Visit 5 different checkpoints.', icon: 'explore', tier: 'bronze', requirement: 5, metric: 'checkpoints' },
  { id: 'b3', code: 'points_2500', name: 'Point Hoarder', description: 'Earn 2,500 total points.', icon: 'workspace_premium', tier: 'silver', requirement: 2500, metric: 'points' },
  { id: 'b4', code: 'streak_7', name: 'On a Roll', description: 'Be active 7 days in a row.', icon: 'whatshot', tier: 'silver', requirement: 7, metric: 'streak' },
  { id: 'b5', code: 'streak_30', name: 'Unstoppable', description: 'Be active 30 days in a row.', icon: 'bolt', tier: 'gold', requirement: 30, metric: 'streak' },
  { id: 'b6', code: 'walk_50', name: 'Distance Demon', description: 'Cover 50 km on foot.', icon: 'terrain', tier: 'gold', requirement: 50, metric: 'distance_km' },
  { id: 'b7', code: 'points_10000', name: 'Point Legend', description: 'Earn 10,000 total points.', icon: 'trophy', tier: 'legendary', requirement: 10000, metric: 'points' },
  { id: 'b8', code: 'trailblazer', name: 'Trailblazer', description: 'Visit 15 different checkpoints.', icon: 'map', tier: 'silver', requirement: 15, metric: 'checkpoints' },
];

/* ---------------------------------------------------------- Leaderboard */
export const DEMO_LEADERBOARD: LeaderboardRow[] = [
  { user_id: 'u1', full_name: 'Kwame Boateng', avatar_url: null, points: 4820, level: 7, rank: 1 },
  { user_id: 'u2', full_name: 'Adjoa Nyarko', avatar_url: null, points: 4310, level: 7, rank: 2 },
  { user_id: 'u3', full_name: 'Yaw Oppong', avatar_url: null, points: 3975, level: 6, rank: 3 },
  { user_id: 'demo-user', full_name: 'Ama Mensah', avatar_url: null, points: 2740, level: 6, rank: 4 },
  { user_id: 'u5', full_name: 'Efua Danso', avatar_url: null, points: 2610, level: 5, rank: 5 },
  { user_id: 'u6', full_name: 'Kojo Asante', avatar_url: null, points: 2240, level: 5, rank: 6 },
  { user_id: 'u7', full_name: 'Abena Kwarteng', avatar_url: null, points: 1980, level: 4, rank: 7 },
  { user_id: 'u8', full_name: 'Selorm Agbeko', avatar_url: null, points: 1520, level: 4, rank: 8 },
  { user_id: 'u9', full_name: 'Nana Adjei', avatar_url: null, points: 1140, level: 3, rank: 9 },
  { user_id: 'u10', full_name: 'Akosua Frimpong', avatar_url: null, points: 890, level: 3, rank: 10 },
];

/* --------------------------------------------------------------- FitClips */
export const DEMO_CLIPS: FitClip[] = [
  { id: 'f1', user_id: 'u1', caption: 'Sunrise laps at the stadium 🏃‍♂️', video_url: '', thumbnail_url: null, likes_count: 214, created_at: '' },
  { id: 'f2', user_id: 'u2', caption: 'Yoga on the quad before class 🧘‍♀️', video_url: '', thumbnail_url: null, likes_count: 168, created_at: '' },
  { id: 'f3', user_id: 'u3', caption: 'Ridge trail views today 🔥', video_url: '', thumbnail_url: null, likes_count: 342, created_at: '' },
  { id: 'f4', user_id: 'u5', caption: 'New PB on the lake loop ⚡', video_url: '', thumbnail_url: null, likes_count: 97, created_at: '' },
];

/* ------------------------------------------------------------- FitTrips */
export const DEMO_TRIPS: FitTrip[] = [
  { id: 't1', name: 'Sunset Lake Loop', description: 'A calm loop out to the pier and back as the sun drops.', distance_km: 4.2, difficulty: 'easy', participants_count: 1240, cover_url: null },
  { id: 't2', name: 'The Quad Sprint', description: 'Fast laps around the central quadrangle.', distance_km: 2.8, difficulty: 'medium', participants_count: 840, cover_url: null },
  { id: 't3', name: 'Ridge Trail Climb', description: 'The long western ridge ascent — bring water.', distance_km: 6.5, difficulty: 'hard', participants_count: 410, cover_url: null },
  { id: 't4', name: 'Heritage Walk', description: 'Every historic arch and monument on campus.', distance_km: 3.4, difficulty: 'easy', participants_count: 690, cover_url: null },
];

/* ----------------------------------------------------------------- Clubs */
export const DEMO_CLUBS: Club[] = [
  { id: 'cl1', name: 'Varsity Run Club', description: 'Weekly paced runs for every ability.', member_count: 156, color: '#1ecc8b' },
  { id: 'cl2', name: 'Yoga Collective', description: 'Sunrise sessions on the quad lawn.', member_count: 184, color: '#c07eff' },
  { id: 'cl3', name: 'Cycling Guild', description: 'Weekend rides beyond the campus gates.', member_count: 146, color: '#f5a623' },
  { id: 'cl4', name: 'HIIT Club', description: 'High-intensity interval training, twice weekly.', member_count: 229, color: '#ba1a1a' },
  { id: 'cl5', name: 'Hiking Circle', description: 'Trail days at the ridge and forest.', member_count: 97, color: '#006c47' },
];

/**
 * Difficulty multipliers — must match scan_checkpoint() in the migration.
 */
export const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  easy: 1.0,
  medium: 1.3,
  hard: 1.8,
  epic: 2.5,
};

/** Points needed to reach a given level (level = floor(sqrt(points/100)) + 1). */
export function levelForPoints(points: number): number {
  return Math.max(1, Math.floor(Math.sqrt(points / 100)) + 1);
}

export function pointsForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}
