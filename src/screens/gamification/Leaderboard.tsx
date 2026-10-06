import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, ScreenHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchLeaderboard } from '../../lib/api';
import type { LeaderboardRow } from '../../lib/types';

/**
 * Objective 6 — leaderboard. Ranks come from the `leaderboard` SQL view
 * (ranked by points); demo rows stand in before Supabase is configured.
 */
export default function Leaderboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchLeaderboard()
      .then(data => {
        if (alive) setRows(data);
      })
      .catch(() => {
        if (alive) setRows([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myRank = rows.find(r => r.user_id === profile?.id);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Leaderboard"
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/badges')}
            aria-label="Badges"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80"
          >
            <Icon name="workspace_premium" size={22} />
          </button>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {/* Your standing ------------------------------------------------- */}
        <section className="rounded-card bg-inverse-surface p-lg text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">
                Your rank
              </p>
              <p className="font-display-lg text-display-lg">
                #{myRank?.rank ?? '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-white/60">
                Points
              </p>
              <p className="font-headline-lg text-headline-lg text-primary-fixed">
                {(profile?.points ?? 0).toLocaleString()}
              </p>
              <p className="font-label-sm text-label-sm text-white/60">
                Level {profile?.level ?? 1} · {profile?.streak_days ?? 0}-day streak
              </p>
            </div>
          </div>
        </section>

        {/* Podium --------------------------------------------------------- */}
        <section className="flex items-end justify-center gap-sm">
          {loading && (
            <div className="skeleton h-40 w-full rounded-card" aria-busy="true" />
          )}
          {!loading &&
            [podium[1], podium[0], podium[2]].map((row, i) => {
              if (!row) return null;
              const place = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = ['h-20', 'h-28', 'h-16'];
              return (
                <div key={row.user_id} className="flex w-1/3 flex-col items-center gap-xs">
                  {place === 1 && (
                    <span className="material-symbols-outlined text-[28px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      trophy
                    </span>
                  )}
                  <Avatar name={row.full_name} url={row.avatar_url} size={place === 1 ? 64 : 52} />
                  <p className="max-w-full truncate font-label-md text-label-md font-semibold">
                    {row.full_name.split(' ')[0]}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {row.points.toLocaleString()} pts
                  </p>
                  <div
                    className={`flex w-full items-start justify-center rounded-t-2xl pt-2 ${heights[place - 1]}`}
                    style={{
                      background:
                        place === 1
                          ? 'linear-gradient(180deg,#1ecc8b55,transparent)'
                          : 'rgba(24,28,26,0.06)',
                    }}
                  >
                    <span className="font-title-md text-title-md text-on-surface-variant">
                      <Icon name="military_tech" size={22} fill={place === 1} />
                    </span>
                    <span className="sr-only">{place}</span>
                  </div>
                </div>
              );
            })}
        </section>

        {/* Full table ------------------------------------------------------ */}
        <section className="card divide-y divide-outline-variant/50 overflow-hidden">
          {loading && (
            <div className="space-y-sm p-md">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          )}
          {!loading && rest.length === 0 && podium.length === 0 && (
            <p className="p-md font-body-md text-body-md text-on-surface-variant">
              No rankings yet — be the first to scan a checkpoint.
            </p>
          )}
          {rest.map(row => {
            const mine = row.user_id === profile?.id;
            return (
              <div
                key={row.user_id}
                className="flex items-center gap-sm px-md py-3"
                style={mine ? { background: 'rgba(30,204,139,0.10)' } : undefined}
              >
                <span className="w-6 text-center font-label-md text-label-md font-semibold text-on-surface-variant">
                  {row.rank}
                </span>
                <Avatar name={row.full_name} url={row.avatar_url} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-label-md text-label-md font-semibold">
                    {row.full_name}
                    {mine && <span className="text-primary"> · you</span>}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Level {row.level}
                  </p>
                </div>
                <span className="font-label-md text-label-md font-bold text-primary">
                  {row.points.toLocaleString()}
                </span>
              </div>
            );
          })}
        </section>

        <p className="pb-2 text-center font-label-sm text-label-sm text-on-surface-variant">
          Rankings reset every Monday at 00:00 · <span className="uppercase">campus league</span>
        </p>
      </main>
    </div>
  );
}
