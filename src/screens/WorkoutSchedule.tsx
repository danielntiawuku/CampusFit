import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Icon, DifficultyPill } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchFitTrips, fetchCheckpoints } from '../lib/api';
import type { FitTrip, Checkpoint } from '../lib/types';
import { DIFFICULTY_MULTIPLIER } from '../lib/demo';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Distribute trips across the week for the schedule view. */
function scheduleTrips(trips: FitTrip[]) {
  const plan: Record<string, FitTrip | null> = {};
  WEEKDAYS.forEach((day, i) => {
    plan[day] = trips[i] ?? null;
  });
  return plan;
}

export default function WorkoutSchedule() {
  const navigate = useNavigate();
  useAuth();
  const [trips, setTrips] = useState<FitTrip[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchFitTrips(), fetchCheckpoints().catch(() => [])])
      .then(([tripData, cpData]) => {
        if (!cancelled) {
          setTrips(tripData);
          setCheckpoints(cpData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const plan = scheduleTrips(trips);

  function pointsForTrip(trip: FitTrip) {
    const cps = checkpoints.filter(c => c.difficulty === trip.difficulty);
    if (cps.length === 0) return trip.distance_km * 25;
    const avg = cps.reduce((s, c) => s + c.base_points, 0) / cps.length;
    return Math.round(avg * (DIFFICULTY_MULTIPLIER[trip.difficulty] ?? 1) * (trip.distance_km / 2));
  }

  return (
    <div className="flex flex-col">        <ScreenHeader
        title="Workout Schedule"
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="All routes"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="view_list" size={20} />
          </button>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          Your weekly plan. Each trip is a workout you can start from the map.
        </p>

        {loading ? (
          <div className="space-y-md">
            {WEEKDAYS.map(day => (
              <div key={day} className="skeleton h-28 rounded-card" />
            ))}
          </div>
        ) : (
          <div className="space-y-md">
            {WEEKDAYS.map(day => {
              const trip = plan[day];
              return (
                <div key={day} className="card p-md">
                  <div className="flex items-center justify-between mb-sm">
                    <span className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
                      {day}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {trip ? '1 workout' : 'Rest day'}
                    </span>
                  </div>
                  {trip ? (
                    <div
                      className="flex items-center gap-md cursor-pointer"
                      onClick={() => navigate(`/workout/${trip.id}`)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-container/15 flex items-center justify-center">
                        <Icon
                          name={trip.difficulty === 'easy' ? 'directions_run' : trip.difficulty === 'medium' ? 'fitness_center' : trip.difficulty === 'hard' ? 'hiking' : 'extreme_sport'}
                          size={22}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-body-md font-semibold text-on-surface truncate">
                          {trip.name}
                        </p>
                        <div className="flex items-center gap-sm mt-xs">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {trip.distance_km} km
                          </span>
                          <DifficultyPill level={trip.difficulty} />
                          <span className="font-label-sm text-label-sm text-primary font-semibold">
                            ~{pointsForTrip(trip)} pts
                          </span>
                        </div>
                      </div>
                      <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-md py-sm">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high/30 flex items-center justify-center">
                        <Icon name="self_improvement" size={22} className="text-on-surface-variant" />
                      </div>
                      <p className="font-label-md text-label-md text-on-surface-variant flex-1">
                        Rest or light stretch
                      </p>
                      <Icon name="check" size={18} className="text-on-surface-variant" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-md">
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">How to use this schedule</p>
          <ul className="mt-sm space-y-xs">
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">map</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Tap any workout to open the campus map and start the route.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">qr_code_scanner</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Scan checkpoints along the way to earn points for your profile.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">emoji_events</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Weekly active minutes and points update automatically after each scan.</p>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore/map')}
          className="btn-primary w-full"
        >
          <Icon name="play_arrow" size={18} className="inline mr-sm" style={{ fontVariationSettings: "'FILL' 1" }} />
          Start today's workout
        </button>
      </main>
    </div>
  );
}
