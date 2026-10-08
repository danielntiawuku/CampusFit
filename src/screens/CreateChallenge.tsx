import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, ScreenHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { createChallenge, fetchClubs } from '../lib/api';
import type { Challenge, Club } from '../lib/types';

const METRICS: { value: Challenge['metric']; label: string }[] = [
  { value: 'scans', label: 'Checkpoints scanned' },
  { value: 'points', label: 'Points earned' },
  { value: 'distance_km', label: 'Distance (km)' },
  { value: 'checkpoints', label: 'Distinct checkpoints' },
];

const DURATIONS = [7, 14, 30];

export default function CreateChallenge() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState('');
  const [metric, setMetric] = useState<Challenge['metric']>('scans');
  const [target, setTarget] = useState('10');
  const [reward, setReward] = useState('100');
  const [days, setDays] = useState(7);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    if (!profile?.id) {
      setError('Sign in to create a challenge.');
      return;
    }
    if (!title.trim()) {
      setError('Give the challenge a title.');
      return;
    }

    const targetValue = Number(target);
    const pointsReward = Number(reward);
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      setError('Target must be a positive number.');
      return;
    }
    if (!Number.isFinite(pointsReward) || pointsReward < 0) {
      setError('Reward cannot be negative.');
      return;
    }

    setBusy(true);
    try {
      const now = Date.now();
      await createChallenge(profile.id, {
        title: title.trim(),
        description: description.trim(),
        clubId: clubId || null,
        metric,
        targetValue,
        pointsReward,
        startsAt: new Date(now).toISOString(),
        endsAt: new Date(now + days * 86400000).toISOString(),
      });
      navigate('/challenges', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the challenge.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="New challenge" onBack={() => navigate(-1)} />

      <main className="px-container-padding pb-10 space-y-md">
        {error && <Alert>{error}</Alert>}

        <form className="space-y-md" onSubmit={onSubmit}>
          <div className="space-y-xs">
            <label htmlFor="ch-title" className="font-label-md text-label-md text-on-surface-variant">
              Title
            </label>
            <input
              id="ch-title"
              className="field"
              placeholder="e.g. Morning Miles"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="ch-desc" className="font-label-md text-label-md text-on-surface-variant">
              Description
            </label>
            <textarea
              id="ch-desc"
              className="field h-auto resize-none py-3"
              rows={3}
              placeholder="What is the goal?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="ch-club" className="font-label-md text-label-md text-on-surface-variant">
              Club (optional)
            </label>
            <select
              id="ch-club"
              className="field"
              value={clubId}
              onChange={e => setClubId(e.target.value)}
            >
              <option value="">Open to everyone</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-xs">
            <label htmlFor="ch-metric" className="font-label-md text-label-md text-on-surface-variant">
              Metric
            </label>
            <select
              id="ch-metric"
              className="field"
              value={metric}
              onChange={e => setMetric(e.target.value as Challenge['metric'])}
            >
              {METRICS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-xs">
              <label htmlFor="ch-target" className="font-label-md text-label-md text-on-surface-variant">
                Target
              </label>
              <input
                id="ch-target"
                className="field"
                type="number"
                min={1}
                value={target}
                onChange={e => setTarget(e.target.value)}
              />
            </div>
            <div className="space-y-xs">
              <label htmlFor="ch-reward" className="font-label-md text-label-md text-on-surface-variant">
                Reward (pts)
              </label>
              <input
                id="ch-reward"
                className="field"
                type="number"
                min={0}
                step={10}
                value={reward}
                onChange={e => setReward(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Duration</span>
            <div className="flex gap-sm">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  data-active={days === d}
                  className="chip"
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-sm pt-sm">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-60">
              {busy ? 'Saving…' : 'Create challenge'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
