-- ============================================================================
-- CampusFit — seed data
-- Run with: supabase db reset   (or psql -f supabase/seed.sql)
-- Safe to re-run: all inserts are idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- badges : metric + requirement -> awarded automatically by
--          award_eligible_badges()
-- ---------------------------------------------------------------------------
insert into public.badges (code, name, description, icon, tier, requirement, metric) values
  ('first_steps',   'First Steps',        'Scan your very first checkpoint.',                    'directions_walk',  'bronze',    1,   'scans'),
  ('explorer',      'Campus Explorer',    'Visit 5 different checkpoints.',                      'explore',          'bronze',    5,   'checkpoints'),
  ('trailblazer',   'Trailblazer',        'Visit 15 different checkpoints.',                     'map',              'silver',    15,  'checkpoints'),
  ('century',       'Century Club',       'Scan 100 checkpoints in total.',                      'checkroom',        'gold',      100, 'scans'),
  ('grand_tourer',  'Grand Tourer',       'Visit every checkpoint on campus.',                   'public',           'legendary', 25,  'checkpoints'),
  ('points_500',    'Point Collector',    'Earn 500 total points.',                              'stars',            'bronze',    500, 'points'),
  ('points_2500',   'Point Hoarder',      'Earn 2,500 total points.',                            'workspace_premium', 'silver',   2500, 'points'),
  ('points_10000',  'Point Legend',       'Earn 10,000 total points.',                           'trophy',           'legendary', 10000,'points'),
  ('streak_3',      'Warming Up',        'Be active 3 days in a row.',                          'local_fire_department','bronze', 3,   'streak'),
  ('streak_7',      'On a Roll',         'Be active 7 days in a row.',                          'whatshot',         'silver',    7,   'streak'),
  ('streak_30',     'Unstoppable',       'Be active 30 days in a row.',                         'bolt',             'gold',      30,  'streak'),
  ('walk_10',       'Marathon Walker',   'Cover 10 km on foot.',                                'directions_run',   'bronze',    10,  'distance_km'),
  ('walk_50',       'Distance Demon',    'Cover 50 km on foot.',                                'terrain',          'gold',      50,  'distance_km')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- checkpoints : QR/NFC stations placed around campus
-- Replace coordinates with your campus survey data.
-- ---------------------------------------------------------------------------
insert into public.checkpoints (code, name, description, location, latitude, longitude, difficulty, base_points) values
  ('LIB-A1',  'Main Library Steps',      'Climb the front steps of the main library.',        'University Library',        5.6116, -0.1848, 'easy',   10),
  ('QUAD-N',  'North Quad Lawn',         'Cross the north quad lawn.',                        'North Quadrangle',          5.6124, -0.1839, 'easy',   10),
  ('GYM-ENT', 'Recreation Centre Door',  'Enter the student recreation centre.',              'Student Rec Centre',        5.6109, -0.1861, 'easy',   12),
  ('STAD-1',  'Stadium Bends',           'Run the stadium stairway.',                         'Sports Stadium',            5.6101, -0.1872, 'medium', 18),
  ('SCI-BK',  'Science Block Rear',      'Walk the path behind the science block.',           'Science Block',             5.6131, -0.1855, 'medium', 18),
  ('ENG-BR',  'Engineering Bridge',      'Cross the engineering footbridge.',                 'Engineering Bridge',        5.6138, -0.1866, 'medium', 20),
  ('HALL-A',  'Hall A Courtyard',        'Cut through the Hall A courtyard.',                 'Hall A',                    5.6112, -0.1834, 'easy',   10),
  ('CAF-E',   'Cafeteria Terrace',       'Take the terrace steps by the cafeteria.',          'Main Cafeteria',            5.6118, -0.1870, 'easy',   12),
  ('ART-DOM', 'Arts Dome',               'Reach the arts district dome.',                     'Arts Dome',                 5.6142, -0.1842, 'hard',   25),
  ('HILL-T',  'Observatory Hill',        'The long climb up to the observatory.',             'Observatory Hill',          5.6094, -0.1829, 'hard',   28),
  ('LAKE-LP', 'Lake Loop Pier',          'Full loop out to the lake pier.',                   'Campus Lake',               5.6087, -0.1885, 'epic',   35),
  ('GATE-S',  'South Gate Arch',         'Down to the south entrance arch.',                  'South Gate',                5.6079, -0.1851, 'medium', 16),
  ('DORM-W',  'West Residence Block',    'Up the west residence stairs.',                     'West Residences',           5.6147, -0.1877, 'medium', 18),
  ('MED-C',   'Medical Centre Ramp',     'Around the medical centre ramp.',                   'Campus Medical Centre',     5.6105, -0.1840, 'easy',   10),
  ('BUS-Y',   'Bus Yard Turn',           'The far corner by the bus yard.',                   'Transport Yard',            5.6092, -0.1869, 'hard',   26),
  ('BOT-G',   'Botanic Garden Gate',     'Through the botanic garden gate.',                  'Botanic Garden',            5.6151, -0.1831, 'hard',   26),
  ('POOL-D',  'Aquatics Deck',           'Out to the pool deck and back.',                    'Aquatics Centre',           5.6098, -0.1858, 'medium', 18),
  ('UNI-CEN', 'University Centre Atrium', 'Through the main atrium.',                         'University Centre',         5.6121, -0.1846, 'easy',   10),
  ('PERF-T',  'Performing Arts Steps',   'The front flight at performing arts.',              'Performing Arts Theatre',   5.6135, -0.1874, 'medium', 18),
  ('RIDGE-W', 'Western Ridge Trail',     'Along the western ridge trail.',                    'Western Ridge',             5.6155, -0.1859, 'epic',   40),
  ('LAUNCH',  'Innovation Launchpad',    'The launchpad by the innovation hub.',              'Innovation Hub',            5.6128, -0.1827, 'easy',   12),
  ('TOWER',   'Clock Tower Base',        'Circle the clock tower base.',                      'Clock Tower',               5.6119, -0.1854, 'easy',   10),
  ('FIELD-S', 'South Playing Fields',    'Down to the south playing fields.',                 'South Fields',              5.6083, -0.1877, 'hard',   25),
  ('ARCH-B',  'Historic Arch',           'Under the historic founding arch.',                 'Founding Arch',             5.6144, -0.1849, 'medium', 16),
  ('FOREST-E','Eastern Forest Trail',    'Into the eastern tree trail.',                      'Eastern Trail',             5.6158, -0.1868, 'epic',   38)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- fittrips : curated social routes
-- ---------------------------------------------------------------------------
insert into public.fittrips (name, description, distance_km, difficulty, participants_count) values
  ('Sunset Lake Loop',   'A calm loop out to the pier and back as the sun drops.',  4.2, 'easy',   1240),
  ('The Quad Sprint',    'Fast laps around the central quadrangle.',                2.8, 'medium', 840),
  ('Ridge Trail Climb',  'The long western ridge ascent — bring water.',            6.5, 'hard',   410),
  ('Heritage Walk',      'Every historic arch and monument on campus.',             3.4, 'easy',   690),
  ('Stadium Verts',      'Stair repeats at the sports stadium.',                    1.9, 'epic',   275),
  ('Dawn Patrol',        'Early circuit of the north fields before lectures.',      5.1, 'medium', 520)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- clubs
-- ---------------------------------------------------------------------------
insert into public.clubs (name, description, member_count, color) values
  ('Run Society',      'Weekly paced runs for every ability.',        312, '#1ecc8b'),
  ('Yoga Collective',  'Sunrise sessions on the quad lawn.',          184, '#c07eff'),
  ('Cycling Guild',    'Weekend rides beyond the campus gates.',      146, '#f5a623'),
  ('HIIT Club',        'High-intensity interval training, twice weekly.', 229, '#ba1a1a'),
  ('Hiking Circle',    'Trail days at the ridge and forest.',         97,  '#006c47')
on conflict do nothing;
