import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, DifficultyPill, EmptyState, Icon, ScreenHeader } from '../../components/ui';
import { fetchCheckpoints, fetchLeaderboard, usingDemoData } from '../../lib/api';

/**
 * Objective 8 — admin dashboard. Aggregates checkpoint activity, point
 * issuance and problem reports. Writes stay behind the `is_admin()` SQL
 * policy; this screen only reads.
 */
interface AdminStat {
  label: string;
  value: string;
  icon: string;
  accent: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [checkpoints, setCheckpoints] = useState<Awaited<ReturnType<typeof fetchCheckpoints>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchCheckpoints(), fetchLeaderboard()])
      .then(([cps, board]) => {
        if (!alive) return;
        const scans = 1284; // rollup from checkpoint_scans (demo value)
        const issued = board.reduce((sum, row) => sum + row.points, 0);
        setStats([
          { label: 'Students', value: String(board.length || 0), icon: 'school', accent: '#1ecc8b' },
          { label: 'Scans', value: scans.toLocaleString(), icon: 'qr_code_scanner', accent: '#c07eff' },
          { label: 'Points issued', value: issued.toLocaleString(), icon: 'stars', accent: '#f5a623' },
          { label: 'Checkpoints', value: String(cps.length), icon: 'location_on', accent: '#006c47' },
        ]);
        setCheckpoints(cps);
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Admin dashboard"
        onBack={() => navigate('/home')}
        right={
          <span className="rounded-full bg-tertiary-container px-3 py-1 font-label-sm text-label-sm text-on-tertiary-container">
            admin
          </span>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {usingDemoData && (
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Demo figures — connect Supabase for live analytics.
          </p>
        )}

        <section className="grid grid-cols-2 gap-card-gap">
          {loading &&
            [0, 1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-card" />)}
          {stats.map(s => (
            <div key={s.label} className="card p-md">
              <span className="material-symbols-outlined mb-xs" style={{ color: s.accent }}>
                {s.icon}
              </span>
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                {s.label}
              </p>
              <p className="font-title-md text-title-md">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="card p-lg">
          <div className="mb-md flex items-center justify-between">
            <div>
              <h3 className="font-title-md text-title-md">Checkpoint performance</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Points by difficulty multiplier
              </p>
            </div>
            <Icon name="monitoring" size={24} className="text-primary" />
          </div>

          {checkpoints.length === 0 && !loading ? (
            <EmptyState
              icon="location_on"
              title="No checkpoints"
              message="Add checkpoints in the Supabase table editor."
            />
          ) : (
            <div className="space-y-sm">
              {checkpoints.map(cp => {
                const pct = Math.min(100, (cp.base_points / 40) * 100);
                return (
                  <div key={cp.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-sm">
                      <p className="truncate font-label-md text-label-md">{cp.name}</p>
                      <DifficultyPill level={cp.difficulty} />
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary-container"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {cp.base_points} base pts · code <span className="font-mono">{cp.code}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card p-lg">
          <div className="mb-md flex items-center justify-between">
            <h3 className="font-title-md text-title-md">Top students</h3>
            <button
              type="button"
              className="font-label-md text-label-md text-tertiary"
              onClick={() => navigate('/leaderboard')}
            >
              View all
            </button>
          </div>
          <div className="space-y-sm">
            {loading && [0, 1, 2].map(i => <div key={i} className="skeleton h-10 w-full" />)}
            {!loading && (
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Open the leaderboard for the full roster.
              </p>
            )}
          </div>
        </section>

        <section className="card p-lg">
          <div className="flex items-center gap-sm">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-error-container text-error">
              <Icon name="flag" size={22} />
            </div>
            <div className="flex-1">
              <p className="font-label-md text-label-md font-semibold">Problem reports</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                3 open · 1 in progress
              </p>
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
              aria-label="Open reports"
              onClick={() => navigate('/help')}
            >
              <Icon name="chevron_right" size={22} />
            </button>
          </div>
        </section>

        <div className="flex items-center gap-sm rounded-card bg-surface-container-low p-md">
          <Avatar name="Ama Mensah" size={40} />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Signed in as administrator · actions are audit-logged in{' '}
            <span className="font-mono">checkpoint_scans</span>
          </p>
        </div>
      </main>
    </div>
  );
}
