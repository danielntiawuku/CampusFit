import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';
import { fetchFitTrips } from '../lib/api';
import type { FitTrip } from '../lib/types';

interface Props {
  tripId?: string;
}

export default function WorkoutDetail({ tripId }: Props) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<FitTrip[]>([]);

  useEffect(() => {
    fetchFitTrips()
      .then(setTrips)
      .catch(() => setTrips([]));
  }, []);

  const trip = tripId ? trips.find(t => t.id === tripId) : trips[0] ?? null;

  if (tripId && trips.length === 0) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Workout Details" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">progress_activity</span>
        </div>
      </div>
    );
  }
  if (tripId && !trip) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Workout Details" onBack={() => navigate(-1)} />
        <p className="px-container-padding py-xl text-center text-on-surface-variant">
          This workout could not be found.
        </p>
      </div>
    );
  }

  const workouts = [
    { title: trip?.name ?? 'Campus Run', subtitle: trip?.description ?? 'Morning trail run', distance: trip?.distance_km ?? 4.2, duration: '24:15', pace: '5:45 /km', calories: 387, color: 'primary' },
    { title: 'Morning Yoga', subtitle: 'Flow session before lectures', distance: null, duration: '45:00', pace: null, calories: 180, color: 'secondary' },
    { title: 'Stair Climb', subtitle: 'University centre stairs', distance: null, duration: '15:30', pace: null, calories: 145, color: 'tertiary' },
  ];

  const active = workouts[0];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Workout Details"
        onBack={() => navigate(-1)}
      />

      <main className="px-container-padding pb-8 space-y-lg">
        {/* Map card */}
        <section className="rounded-card overflow-hidden custom-shadow">
          <div className="aspect-[9/16] bg-surface-container-lowest relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-full max-w-[200px] aspect-[9/16] bg-surface-container-high/30 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-container shadow-lg shadow-primary/30">
                  <Icon name="location_on" size={24} className="text-primary" />
                </div>
              </div>
            </div>
            {/* Pace markers */}
            <div className="absolute left-4 bottom-8 flex flex-col items-center">
              <div className="h-1 w-1 rounded-full bg-primary-container" />
              <div className="h-1 w-0.5 rounded-full bg-primary-container/60" />
              <div className="h-1 w-2 rounded-full bg-primary-container/40" />
              <div className="h-1 w-0.5 rounded-full bg-primary-container/60" />
              <div className="h-1 w-1 rounded-full bg-primary-container" />
            </div>
          </div>
        </section>

        {/* Stats cards */}
        <section className="grid grid-cols-2 gap-card-gap">
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Distance</p>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">
              {active.distance ?? '—'} <span className="font-label-md text-label-md text-on-surface-variant">km</span>
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Duration</p>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">{active.duration}</p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Avg Pace</p>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">
              {active.pace ?? '—'}
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Calories</p>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">{active.calories} <span className="font-label-md text-label-md text-on-surface-variant">kcal</span></p>
          </div>
        </section>

        {/* Recent workouts */}
        <section className="space-y-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-title-md text-title-md">Recent workouts</h3>
            <button
              type="button"
              onClick={() => navigate('/stats')}
              className="text-primary font-label-md"
            >
              View all
            </button>
          </div>
          <div className="space-y-sm">
            {workouts.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-md p-md bg-surface-container-lowest rounded-2xl cursor-pointer transition hover:shadow-card active:scale-[0.99]"
              >
                <div className={`w-12 h-12 rounded-xl bg-${w.color === 'primary' ? 'primary' : w.color === 'secondary' ? 'secondary' : 'tertiary'}-container/15 flex items-center justify-center`}>
                  <Icon name={i === 0 ? 'directions_run' : i === 1 ? 'self_improvement' : 'stairs'} size={22} className={`text-${w.color === 'primary' ? 'primary' : w.color === 'secondary' ? 'secondary' : 'tertiary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{w.title}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{w.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className={`font-label-md font-bold ${w.color === 'primary' ? 'text-primary' : w.color === 'secondary' ? 'text-secondary' : 'text-tertiary'}`}>
                    {w.duration}
                  </p>
                  <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
