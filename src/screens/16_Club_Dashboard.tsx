/* eslint-disable */
/**
 * Screen 16 — Club Dashboard
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/16_Club_Dashboard.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pointsForLevel } from '../lib/data';
import { fetchChallenges, fetchClubs, fetchLeaderboard } from '../lib/api';
import type { Challenge, Club, LeaderboardRow } from '../lib/types';

/** Days remaining before a challenge ends (0 once it is over). */
function daysLeft(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

const METRIC_SHORT: Record<Challenge['metric'], string> = {
  scans: 'scans',
  points: 'pts',
  distance_km: 'km',
  checkpoints: 'spots',
};

export default function Stitch16_Club_Dashboard() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const club = clubs[0];
  const members = board.slice(0, 3).map((r) => {
    const cur = pointsForLevel(r.level);
    const next = pointsForLevel(r.level + 1);
    const pct = next > cur
      ? Math.min(100, Math.max(0, Math.round(((r.points - cur) / (next - cur)) * 100)))
      : 100;
    return { name: r.full_name, pct, id: r.user_id };
  });

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
    fetchLeaderboard()
      .then(setBoard)
      .catch(() => setBoard([]));
    fetchChallenges()
      .then(setChallenges)
      .catch(() => setChallenges([]));
  }, []);

  const handleMemberClick = () => {
    navigate('/leaderboard');
  };

  function renderChallenge(challenge: Challenge) {
    const days = daysLeft(challenge.ends_at);
    const icon =
      challenge.metric === 'distance_km'
        ? 'directions_run'
        : challenge.metric === 'points'
          ? 'stars'
          : 'qr_code_scanner';
    return (
      <button
        key={challenge.id}
        type="button"
        onClick={() => navigate(`/challenges/${challenge.id}`)}
        className="min-w-[260px] bg-surface-container-lowest soft-border rounded-2xl p-lg space-y-md flex-shrink-0 animate-fade-up text-left transition hover:shadow-card-lg active:scale-[0.99]"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-body-lg text-body-lg font-bold text-on-surface">{challenge.title}</h4>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {days > 0 ? `Ends in ${days}d` : 'Ended'} · {challenge.club?.name ?? 'Open challenge'}
            </p>
          </div>
          <span className={`material-symbols-outlined ${days > 0 ? 'text-tertiary' : 'text-secondary'}`}>
            {icon}
          </span>
        </div>
        <div className="space-y-xs">
          <div className="flex justify-between font-label-sm text-label-sm">
            <span>Goal</span>
            <span className="text-primary">
              {challenge.target_value} {METRIC_SHORT[challenge.metric]} · +{challenge.points_reward}
            </span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
            {challenge.description || 'Tap for details'}
          </p>
        </div>
      </button>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-container-padding py-sm w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="material-symbols-outlined text-on-surface-variant active:scale-90 transition-transform"
          >
            arrow_back
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Club logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcCQpGW68eIs_kV3ShREJvXQa8nR5DA50t1b8meoYRo1obKbTc4Nk__SpXGG405caUy6I01vBbw_bBXBjK1-L3Tykp816a4Nni-KmxKiynfCx3AYkIgmB4-yTkeTaodwJYW1myB4qCWvZmRd6hCHqfvPA7kB4lG4i9KlngTz9a-ygIPI1_mRjgfWKVAVK_vd_6OVCbhED9VDymJTLPOGXM0jtr-7d3fNMm6227i8VebfSf7ZCLoeViwdq3W1vU9fv2ZDJxYL9EtYO0"
            />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            {club?.name ?? 'Club'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150"
        >
          <span className="material-symbols-outlined text-primary">settings</span>
        </button>
      </nav>

      <main className="px-container-padding pt-lg space-y-xl pb-24">
        <header className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                {club?.name ?? 'Club'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {club?.description ?? ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-md py-xs rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors active:scale-95"
            >
              Manage club
            </button>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex-1 px-md py-xs rounded-full border border-outline-variant/40 bg-transparent text-label-md text-label-md text-on-surface-variant hover:bg-surface-container/50 transition-colors"
            >
              View leaderboard
            </button>
            <button
              onClick={() => navigate('/record')}
              className="flex-1 px-md py-xs rounded-full border border-primary/30 bg-primary-container/10 text-primary font-label-md text-label-md hover:bg-primary-container/20 transition-colors"
            >
              Scan a spot
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-md">
          <div className="bg-surface-container-lowest soft-border rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Total Members</span>
            <span className="font-title-md text-title-md text-on-surface">{club?.member_count ?? members.length}</span>
          </div>
          <div className="bg-surface-container-lowest soft-border rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Weekly Routes</span>
            <span className="font-title-md text-title-md text-on-surface">42</span>
          </div>
          <div className="bg-surface-container-lowest soft-border rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Rank</span>
            <span className="font-title-md text-title-md text-primary">#3</span>
          </div>
        </section>

        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md text-on-surface">Club Challenges</h3>
            <button
              onClick={() => navigate('/challenges')}
              className="text-primary font-label-md text-label-md"
            >
              View all challenges
            </button>
          </div>
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-container-padding px-container-padding">
            {[...challenges].map(renderChallenge)}
          </div>
        </section>

        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md text-on-surface">Members</h3>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-primary font-label-md text-label-md"
            >
              Full leaderboard
            </button>
          </div>
          <div className="space-y-sm">
            {members.map((m) => (
              <div
                key={m.id}
                onClick={handleMemberClick}
                className="flex items-center gap-md p-md bg-surface-container-lowest soft-border rounded-xl cursor-pointer transition hover:shadow-card active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt={m.name}
                    src={`https://lh3.googleusercontent.com/aida-public/AB6AXu${
                      m.name === 'Alex Chen' ? 'BBoOqEyTxeFjzD7Xv4B-2tpfsh_lwoOLha3IqVDg_f3H3Sm5iG1wRNMkO6TIkJ83PBlOUF0fdVWDtoaCyY1JM9uqf4uu3N9_Y7lUYH2hEgislr_0L7H_Z1RbpWksD9pvQBC4XdvDLX8ybLNqJ25e3CUpqSryE3CmHcDkNQlakOSn7nNu24NuYpTSC-xc22nmwG872tiUGeYec9apyotCbB1K2tgKNQFIs7Cyw5OJrB3qQdvHJNwBXDuR01q4UpMyzqWpsqk7JWUHuh' :
                      m.name === 'Sarah Miller' ? 'DGPMAZ7LwisIxVjZiBqElC6B6SMroC5YwSMqcMRgI8W9rD2qCW9oMp31UBeELaiaLl2xBT11QUcMiDC5mjdCDhtngyj8thrrG7oQwTP9cj3nCC7LJvoDjBwsi7d-Rrx06pxqwmPtBq4nSiEG_PLwbwKbpVhN5Ub0OuaDO2LigCOQlIQgdZJ0kWm0G13xOsqW3tN3qYcKRCcAvhPm-LJaSnSpZm9dk2MZxifhkRgTZ68qHS2PL-Vamg3siLEScNl8jqJBEMs4FPDwbq' :
                      'D2BFEo652vBnNvCkUgWz50QG12n2EUo8T2r6BKGVjoooLNDe8T66XyfqNd-TWWI_A8olzfirH7uOqEsuZyIk-MHhVMt3CRYqPivBAKePA8Slw6PKtuv3Tn_eQi496H31z9wkmwthqQgnrIdGUFSmEXQnf1yX_5X-XRq9ocvricNK1dE-JB9NP_Ajnfjyr9s8N_W2_0pZHDK_C5v2ZcMSr6OcONlmUlPA5enWkmRBsaVj1_v1PxKatfafH0Rx4KdGdEBwGWjkEC7spT'
                    }.JPG`}
                  />
                </div>
                <div className="flex-1 space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">{m.name}</span>
                    <button
                      type="button"
                      className="p-1 hover:bg-surface-container-low rounded-full"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-sm">
                    <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{m.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={() => navigate('/challenges/new')}
        className="fixed bottom-24 right-4 sm:right-6 md:right-8 py-md px-4 sm:px-5 md:px-6 bg-primary-container text-on-primary-container rounded-full shadow-lg active:scale-90 duration-200 z-50 flex items-center gap-xs"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="font-label-md text-label-md">New Challenge</span>
      </button>
    </>
  );
}
