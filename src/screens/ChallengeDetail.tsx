import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, DifficultyPill, Icon, ScreenHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { deleteChallenge, fetchChallenges } from '../lib/api';
import type { Challenge } from '../lib/types';

interface Props {
  challengeId: string;
}

const METRIC_LABEL: Record<Challenge['metric'], string> = {
  scans: 'scans',
  points: 'points',
  distance_km: 'km',
  checkpoints: 'checkpoints',
};

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function ChallengeDetail({ challengeId }: Props) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges()
      .then(setChallenges)
      .catch(() => setChallenges([]));
  }, []);

  const challenge = challenges.find(c => c.id === challengeId);
  const ended = challenge ? new Date(challenge.ends_at).getTime() < Date.now() : false;
  const remaining = challenge
    ? Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / 86400000))
    : 0;

  // Only metrics we can read directly from the signed-in profile.
  const current =
    challenge && profile
      ? challenge.metric === 'points'
        ? profile.points
        : challenge.metric === 'distance_km'
          ? Math.floor(profile.distance_km)
          : null
      : null;
  const progress =
    current !== null && challenge ? Math.min(1, current / challenge.target_value) : null;

  const canDelete =
    profile && (profile.role === 'admin' || profile.id === challenge?.created_by);

  async function onDelete() {
    if (!challenge || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteChallenge(challenge.id);
      navigate('/challenges', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the challenge.');
    } finally {
      setBusy(false);
    }
  }

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Challenge" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">
            progress_activity
          </span>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Challenge" onBack={() => navigate(-1)} />
        <p className="px-container-padding py-xl text-center text-on-surface-variant">
          This challenge could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Challenge" onBack={() => navigate(-1)} />

      <main className="px-container-padding pb-10 space-y-md">
        {error && <Alert>{error}</Alert>}

        <section className="rounded-card bg-primary-container/10 border border-primary/5 p-lg space-y-sm">
          <div className="flex items-center gap-sm">
            <Icon name="emoji_events" size={22} className="text-primary" />
            <span
              className={`chip ${ended ? 'bg-surface-container text-on-surface-variant' : 'bg-primary/10 text-primary'}`}
            >
              {ended ? 'Ended' : `Ends in ${remaining}d`}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">{challenge.title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {challenge.description || 'No description was added for this challenge.'}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-card-gap">
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Target
            </p>
            <p className="font-title-md text-title-md">
              {challenge.target_value} {METRIC_LABEL[challenge.metric]}
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Reward
            </p>
            <p className="font-title-md text-title-md text-primary">{challenge.points_reward} pts</p>
          </div>
        </section>

        <section className="rounded-card bg-surface-container-lowest p-md space-y-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Your progress
            </span>
            <span className="font-label-sm text-label-sm text-on-surface">
              {current !== null ? `${current} / ${challenge.target_value}` : 'Not tracked yet'}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-700"
              style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
            />
          </div>
          {progress === null && (
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              This metric is measured from your checkpoints — start scanning to make progress.
            </p>
          )}
        </section>

        <section className="rounded-card bg-surface-container-lowest p-md space-y-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">info</span>
              <span className="font-label-md text-label-md text-on-surface">
                {challenge.club?.name ?? 'Open challenge'}
              </span>
            </div>
            <DifficultyPill level={challenge.target_value >= 30 ? 'epic' : 'medium'} />
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Starts {formatDate(challenge.starts_at)} · ends {formatDate(challenge.ends_at)} ·
            created by {profile?.id === challenge.created_by ? 'you' : 'another student'}
          </p>
        </section>

        <div className="flex gap-sm">
          <button type="button" onClick={() => navigate('/leaderboard')} className="btn-ghost flex-1">
            Leaderboard
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="btn-ghost flex-1 text-error disabled:opacity-60"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
