/* eslint-disable */
/**
 * Screen 16 — Club Dashboard
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/16_Club_Dashboard.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CLUBS } from '../lib/data';

interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  pct: number;
  active: boolean;
}

const CHALLENGES: Challenge[] = [
  { id: 'morning-miles', title: 'Morning Miles', subtitle: 'Ends in 2 days', icon: 'wb_sunny', pct: 75, active: true },
  { id: 'weekend-warrior', title: 'Weekend Warrior', subtitle: 'Starts tomorrow', icon: 'fitness_center', pct: 20, active: false },
];

const NEW_CHALLENGES: Omit<Challenge, 'id'>[] = [
  { title: 'Streak Sprint', subtitle: 'Starts today', icon: 'whatshot', pct: 0, active: true },
  { title: 'Checkpoint Chase', subtitle: 'Starts Friday', icon: 'qr_code_scanner', pct: 0, active: true },
  { title: 'Sunset 5K', subtitle: 'Starts next week', icon: 'directions_run', pct: 0, active: false },
];

export default function Stitch16_Club_Dashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [extra, setExtra] = useState<Challenge[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  function addChallenge() {
    const template = NEW_CHALLENGES[extra.length % NEW_CHALLENGES.length];
    setExtra(prev => [...prev, { ...template, id: `challenge-${Date.now()}` }]);
  }

  const handleMemberClick = () => {
    navigate('/leaderboard');
  };

  function renderChallenge(challenge: Challenge) {
    return (
      <div
        key={challenge.id}
        className="min-w-[280px] bg-surface-container-lowest soft-border rounded-2xl p-lg space-y-md flex-shrink-0 animate-fade-up"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-body-lg text-body-lg font-bold text-on-surface">{challenge.title}</h4>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{challenge.subtitle}</p>
          </div>
          <span className={`material-symbols-outlined ${challenge.active ? 'text-tertiary' : 'text-secondary'}`}>
            {challenge.icon}
          </span>
        </div>
        <div className="space-y-xs">
          <div className="flex justify-between font-label-sm text-label-sm">
            <span>Progress</span>
            <span className={challenge.active ? 'text-primary' : 'text-on-surface-variant'}>{challenge.pct}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${challenge.active ? 'bg-primary-container' : 'bg-outline-variant'}`}
              style={{ width: mounted ? `${challenge.pct}%` : '0%' }}
            />
          </div>
        </div>
      </div>
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
            {DEMO_CLUBS[0].name}
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
                {DEMO_CLUBS[0].name}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {DEMO_CLUBS[0].description}
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
              Scan checkpoint
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-md">
          <div className="bg-surface-container-lowest soft-border rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Total Members</span>
            <span className="font-title-md text-title-md text-on-surface">{DEMO_CLUBS[0].member_count}</span>
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
              onClick={() => navigate('/leaderboard')}
              className="text-primary font-label-md text-label-md"
            >
              View all challenges
            </button>
          </div>
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-container-padding px-container-padding">
            {[...CHALLENGES, ...extra].map(renderChallenge)}
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
            {[
              { name: 'Alex Chen', pct: 85 },
              { name: 'Sarah Miller', pct: 62 },
              { name: 'Jordan Davis', pct: 45 },
            ].map((m) => (
              <div
                key={m.name}
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
        onClick={addChallenge}
        className="fixed bottom-24 right-4 sm:right-6 md:right-8 py-md px-4 sm:px-5 md:px-6 bg-primary-container text-on-primary-container rounded-full shadow-lg active:scale-90 duration-200 z-50 flex items-center gap-xs"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="font-label-md text-label-md">New Challenge</span>
      </button>
    </>
  );
}
