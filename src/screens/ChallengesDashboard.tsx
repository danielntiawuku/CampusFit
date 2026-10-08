import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Icon, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchClubs, fetchClubMembership, joinClub, leaveClub } from '../lib/api';
import type { Club } from '../lib/types';

export default function ChallengesDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberClubs, setMemberClubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    Promise.all([
      fetchClubs(),
      fetchClubMembership(profile.id).catch(() => []),
    ])
      .then(([clubData, membership]) => {
        if (!cancelled) {
          setClubs(clubData);
          setMemberClubs(membership);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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
      // revert on error
    } finally {
      setJoining(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Challenges" onBack={() => navigate(-1)} />
        <main className="space-y-md px-container-padding pb-8">
          {[1, 2, 3, 4, 5].map(i => (
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
          <button
            type="button"
            onClick={() => navigate('/clubs')}
            aria-label="All clubs"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="groups" size={20} />
          </button>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          Join a club to take part in its challenges. Challenge progress is tracked on the leaderboard.
        </p>

        {clubs.length === 0 ? (
          <EmptyState
            icon="groups"
            title="No challenges yet"
            message="Club challenges will appear here once clubs add them."
          />
        ) : (
          <div className="space-y-md">
            {clubs.map(club => {
              const isMember = memberClubs.includes(club.id);
              return (
                <div
                  key={club.id}
                  className="card p-lg"
                >
                  <div className="flex items-start gap-md">
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: club.color }}
                    >
                      {club.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-sm">
                        <div>
                          <h3 className="font-title-md text-title-md">{club.name}</h3>
                          {club.description && (
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs truncate">
                              {club.description}
                            </p>
                          )}
                        </div>
                        {isMember ? (
                          <button
                            type="button"
                            onClick={() => toggleClub(club.id)}
                            disabled={joining === club.id}
                            className="chip bg-error-container text-error"
                          >
                            {joining === club.id ? 'Joining…' : 'Leave club'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleClub(club.id)}
                            disabled={joining === club.id}
                            className="chip"
                          >
                            {joining === club.id ? 'Joining…' : 'Join club'}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-sm mt-sm pt-sm border-t border-outline-variant/30">
                        <Icon name="people" size={16} className="text-on-surface-variant" />
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {club.member_count} members
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">·</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">
                          {isMember ? 'You are in' : 'Not a member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-md">
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">How challenges work</p>
          <ul className="mt-sm space-y-xs">
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Club leaders add challenges on the club dashboard.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">timer</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Each challenge runs for a set period with a progress goal.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">trending_up</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Your club's total progress appears on the leaderboard.</p>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
