import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';
import { fetchClubs, fetchFitTrips } from '../lib/api';
import { addTodaySteps, stepsToKm } from '../lib/steps';
import { useStepCounter } from '../hooks/useStepCounter';
import type { Club, FitTrip } from '../lib/types';

interface Props {
  tripId?: string;
}

export default function FitTripDetail({ tripId }: Props) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<FitTrip[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    fetchFitTrips()
      .then(setTrips)
      .catch(() => setTrips([]));
    fetchClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
  }, []);

  const [tracking, setTracking] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);
  const { steps, status } = useStepCounter(tracking);

  const trip = tripId ? trips.find(t => t.id === tripId) : trips[0];

  function toggleTracker() {
    if (tracking) {
      setSavedTotal(addTodaySteps(steps));
      setTracking(false);
    } else {
      setSavedTotal(null);
      setTracking(true);
    }
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Trip" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">progress_activity</span>
        </div>
      </div>
    );
  }
  if (!trip) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Trip" onBack={() => navigate(-1)} />
        <p className="px-container-padding py-xl text-center text-on-surface-variant">
          This trip could not be found.
        </p>
      </div>
    );
  }


  const icons: Record<string, string> = {
    easy: 'wc',
    medium: 'directions_run',
    hard: 'hiking',
    epic: 'extreme_sport',
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={trip.name}
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="Back to trips"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="arrow_back" size={20} />
          </button>
        }
      />

      <main className="px-container-padding pb-8 space-y-lg">
        {/* Route preview card */}
        <section className="rounded-card overflow-hidden custom-shadow">
          <div className="aspect-[9/16] bg-surface-container-lowest relative">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-transparent z-10" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-tertiary/20 rounded-2xl blur-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-container shadow-xl shadow-primary/40">
                  <Icon name={icons[trip.difficulty] ?? 'directions_run'} size={32} fill className="text-primary" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl p-md">
                <h2 className="font-headline-lg text-headline-lg text-white mb-xs">{trip.name}</h2>
                <p className="font-body-md text-body-md text-white/80 leading-snug">{trip.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-card-gap">
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="distance" size={20} className="text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Distance</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">
              {trip.distance_km} <span className="font-label-md text-label-md text-on-surface-variant">km</span>
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name={icons[trip.difficulty]} size={20} className="text-secondary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Difficulty</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-secondary">
              {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
            </p>
          </div>
        </section>

        {/* Active clubs */}
        <section className="space-y-md">
          <div className="flex justify-between items-center">
            <h3 className="font-title-md text-title-md">Active clubs</h3>
            <button
              type="button"
              onClick={() => navigate('/clubs')}
              className="font-label-md text-label-md text-primary"
            >
              View all
            </button>
          </div>
          <div className="space-y-sm">
            {clubs.slice(0, 3).map((club) => (
              <button
                key={club.id}
                type="button"
                onClick={() => navigate(`/clubs/${club.id}`)}
                className="flex items-center gap-md p-md bg-surface-container-lowest soft-border rounded-xl cursor-pointer transition hover:shadow-card active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: club.color }}>
                  <Icon name="groups" size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{club.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{club.member_count} members</p>
                </div>
                <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
              </button>
            ))}
          </div>
        </section>

        {/* Step tracker — counts real steps from the device motion sensor */}
        <section className="rounded-card bg-surface-container-lowest soft-border p-md space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">Trip tracker</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {status === 'running'
                ? 'Counting steps…'
                : tracking
                  ? 'Starting…'
                  : savedTotal !== null
                    ? 'Saved'
                    : 'Idle'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-sm text-center">
            <div>
              <p className="font-headline-lg text-headline-lg font-bold text-primary">{steps.toLocaleString()}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Steps</p>
            </div>
            <div>
              <p className="font-headline-lg text-headline-lg font-bold text-secondary">{stepsToKm(steps).toFixed(2)}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Km</p>
            </div>
            <div>
              <p className="font-headline-lg text-headline-lg font-bold text-tertiary">{Math.round(steps * 0.04)}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kcal</p>
            </div>
          </div>

          {(status === 'unsupported' || status === 'denied') && (
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {status === 'denied'
                ? 'Motion access was denied — enable it in your browser settings to count steps.'
                : 'This device has no motion sensor, so steps cannot be counted here.'}
            </p>
          )}

          {savedTotal !== null && (
            <p className="font-label-sm text-label-sm text-primary">
              {steps.toLocaleString()} steps saved — {savedTotal.toLocaleString()} counted on this device today.
            </p>
          )}

          <button
            type="button"
            onClick={toggleTracker}
            disabled={status === 'unsupported' || status === 'denied'}
            className={`w-full h-14 rounded-full font-title-md text-title-md shadow-md transition active:scale-[0.97] flex items-center justify-center gap-sm disabled:opacity-50 ${
              tracking ? 'bg-error-container text-error' : 'bg-primary text-on-primary'
            }`}
          >
            <Icon
              name={tracking ? 'stop_circle' : 'play_circle'}
              size={22}
              fill
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            {tracking ? 'Stop & save' : 'Start this FitTrip'}
          </button>
        </section>

        {/* Tips */}
        <div className="rounded-card bg-primary-container/10 border border-primary/5 p-md space-y-sm">
          <div className="flex items-start gap-sm">
            <Icon name="lightbulb" size={18} className="text-primary mt-0.5" />
            <p className="font-label-sm text-label-sm text-on-primary-container leading-snug">
              Bring water and start early to avoid the midday heat. The ridge trail has the best views around sunset.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
