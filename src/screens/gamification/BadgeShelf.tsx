import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, Icon, ScreenHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchBadges, fetchEarnedBadgeIds } from '../../lib/api';
import type { Badge, BadgeTier } from '../../lib/types';

/**
 * Objective 7 — badge system. Eligibility is evaluated server-side by
 * award_eligible_badges(); this screen renders earned vs. locked state.
 */
const TIER_STYLE: Record<BadgeTier, { bg: string; fg: string; label: string }> = {
  bronze: { bg: 'rgba(196,124,74,0.16)', fg: '#7a4a1d', label: 'Bronze' },
  silver: { bg: 'rgba(120,130,138,0.16)', fg: '#46525a', label: 'Silver' },
  gold: { bg: 'rgba(245,166,35,0.18)', fg: '#835500', label: 'Gold' },
  legendary: { bg: 'rgba(192,126,255,0.18)', fg: '#641ea1', label: 'Legendary' },
};

export default function BadgeShelf() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earned, setEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchBadges(), profile ? fetchEarnedBadgeIds(profile.id) : Promise.resolve([])])
      .then(([all, ids]) => {
        if (!alive) return;
        setBadges(all);
        setEarned(ids);
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [profile]);

  const earnedCount = badges.filter(b => earned.includes(b.id)).length;

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Badges" onBack={() => navigate(-1)} />

      <main className="space-y-lg px-container-padding pb-8">
        <section className="rounded-card bg-inverse-surface p-lg text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-white/60">
                Collection
              </p>
              <p className="font-display-lg text-display-lg text-primary-fixed">
                {earnedCount}
                <span className="text-headline-lg text-white/50">/{badges.length}</span>
              </p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-container/20">
              <Icon name="workspace_premium" size={34} className="text-primary-fixed" />
            </div>
          </div>
          <div className="mt-md h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-700"
              style={{ width: `${badges.length ? (earnedCount / badges.length) * 100 : 0}%` }}
            />
            <span className="sr-only">
              {earnedCount} of {badges.length} badges earned
            </span>
          </div>
        </section>

        {loading && (
          <div className="grid grid-cols-2 gap-card-gap">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton h-40 rounded-card" />
            ))}
          </div>
        )}

        {!loading && badges.length === 0 && (
          <EmptyState
            icon="workspace_premium"
            title="No badges yet"
            message="Scan checkpoints to start earning badges."
          />
        )}

        <section className="grid grid-cols-2 gap-card-gap pb-4">
          {!loading &&
            badges.map(badge => {
              const isEarned = earned.includes(badge.id);
              const tier = TIER_STYLE[badge.tier] ?? TIER_STYLE.bronze;
              return (
                <article
                  key={badge.id}
                  className="card relative flex flex-col items-center gap-xs overflow-hidden p-md text-center"
                  style={isEarned ? { borderColor: tier.bg } : undefined}
                >
                  {!isEarned && (
                    <span className="absolute right-2 top-2 text-on-surface-variant/70">
                      <Icon name="lock" size={16} />
                    </span>
                  )}
                  <div
                    className="grid h-14 w-14 place-items-center rounded-full"
                    style={{
                      background: isEarned ? tier.bg : 'rgba(24,28,26,0.06)',
                      color: isEarned ? tier.fg : 'var(--cf-outline)',
                    }}
                  >
                    <Icon name={badge.icon} size={28} fill={isEarned} />
                  </div>
                  <p
                    className="font-label-sm text-label-sm uppercase"
                    style={{ color: isEarned ? tier.fg : 'var(--cf-outline)' }}
                  >
                    {tier.label}
                  </p>
                  <p className="font-label-md text-label-md font-semibold leading-tight">
                    {badge.name}
                  </p>
                  <p className="font-label-sm text-label-sm font-normal leading-snug text-on-surface-variant">
                    {badge.description}
                  </p>
                </article>
              );
            })}
        </section>
      </main>
    </div>
  );
}
