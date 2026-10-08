import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Icon, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  fetchChallenges,
  fetchClubs,
  fetchClubMembership,
  joinClub,
  leaveClub,
} from '../lib/api';
import type { Challenge, Club } from '../lib/types';

const METRIC_LABEL: Record<Challenge['metric'], string> = {
  scans: 'scans',
  points: 'points',
  distance_km: 'km',
  checkpoints: 'checkpoints',
};

function daysLeft(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function ChallengesDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberClubs, setMemberClubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchChallenges(),
      fetchClubs(),
      profile?.id ? fetchClubMembership(profile.id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([list, clubData, membership]) => {
        if (cancelled) return;
        setChallenges(list);
        setClubs(clubData);
        setMemberClubs(membership);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  async function toggleClub(clubId: string) {
    if (!profile?.id) return;
    setJoining(clubId);
    try {
      if (memberClubs.includes(clubId)) {
        await leaveClub(clubId, profile.id);
        setMemberClubs(prev => prev.filter(id => id !== clubId));
      } else {
        await joinClub(clubId, profile.id);
        setMemberClubs(prev => [...prev, clubId]);
      }
    } catch {
      // leave the list as-is; the server refused the write
    } finally {
      setJoining(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Challenges" onBack={() => navigate(-1)} />
        <main className="space-y-md px-container-padding pb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 rounded-card" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Challenges"
        onBack={() => navigate(-1)}
        right={
          <div className="flex gap-xs">
            <button
              type="button"
              onClick={() => navigate('/clubs')}
              aria-label="Clubs"
              className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
            >
              <Icon name="groups" size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/challenges/new')}
              aria-label="New challenge"
              className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary-container transition hover:opacity-85 active:scale-95"
            >
              <Icon name="add" size={22} />
            </button>
          </div>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        <section className="space-y-sm">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-title-md text-title-md">Active challenges</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Hit the target before the deadline to earn the reward.
              </p>
            </div>
          </div>

          {challenges.length === 0 ? (
            <EmptyState
              icon="emoji_events"
              title="No challenges yet"
              message="Create the first challenge and compete with your club."
            />
          ) : (
            <div className="space-y-sm">
              {challenges.map(challenge => {
                const days = daysLeft(challenge.ends_at);
                return (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                    className="card w-full p-md text-left transition hover:shadow-card-lg active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-md">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-container/15 text-primary">
                        <Icon name="emoji_events" size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-title-md text-title-md">{challenge.title}</p>
                        <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
                          {challenge.club?.name ?? 'Open challenge'} ·{' '}
                          {challenge.target_value} {METRIC_LABEL[challenge.metric]} ·{' '}
                          {challenge.points_reward} pts
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-title-md text-title-md text-primary">
                          {days > 0 ? `${days}d` : 'now'}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">left</p>
                      </div>
                    </div>
                    <p className="mt-sm font-label-sm text-label-sm text-on-surface-variant">
                      {challenge.description || 'No description yet — open for details.'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-sm">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-title-md text-title-md">Clubs</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Join a club to take part in its challenges. Membership is saved to your account.
              </p>
            </div>
          </div>

          {clubs.length === 0 ? (
            <EmptyState
              icon="groups"
              title="No clubs"
              message="Clubs created by an admin will appear here."
            />
          ) : (
            <div className="space-y-sm">
              {clubs.map(club => {
                const isMember = memberClubs.includes(club.id);
                return (
                  <div key={club.id} className="card p-md">
                    <div className="flex items-center justify-between gap-sm">
                      <button
                        type="button"
                        onClick={() => navigate(`/clubs/${club.id}`)}
                        className="flex min-w-0 flex-1 items-center gap-md text-left"
                      >
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-bold text-white"
                          style={{ backgroundColor: club.color }}
                        >
                          {club.name.charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-title-md text-title-md">
                            {club.name}
                          </span>
                          <span className="block font-label-sm text-label-sm text-on-surface-variant">
                            {club.member_count} members ·{' '}
                            {isMember ? 'You are in' : 'Not a member'}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleClub(club.id)}
                        disabled={joining === club.id}
                        className={isMember ? 'chip bg-error-container text-error' : 'chip'}
                      >
                        {joining === club.id
                          ? 'Saving…'
                          : isMember
                            ? 'Leave club'
                            : 'Join club'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
