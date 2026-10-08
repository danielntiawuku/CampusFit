import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';
import { fetchClubs, fetchLeaderboard } from '../lib/api';
import type { Club, LeaderboardRow } from '../lib/types';

interface Props {
  clubId: string;
}

export default function ClubDetail({ clubId }: Props) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
    fetchLeaderboard()
      .then(setBoard)
      .catch(() => setBoard([]));
  }, []);

  const club = clubs.find((c) => c.id === clubId);
  const clubMembers = board.slice(0, 8);

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Club" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">progress_activity</span>
        </div>
      </div>
    );
  }
  if (!club) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Club" onBack={() => navigate(-1)} />
        <p className="px-container-padding py-xl text-center text-on-surface-variant">
          This club could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={club.name}
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/admin')}
            aria-label="Manage club"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="manage_accounts" size={20} />
          </button>
        }
      />

      <main className="px-container-padding pb-8 space-y-lg">
        {/* Club header card */}
        <section className="rounded-card bg-inverse-surface p-lg text-white shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container/30">
                <Icon name="groups" size={28} className="text-primary-fixed" />
              </div>
              <div>
                <p className="font-title-md text-title-md text-white">{club.name}</p>
                <p className="font-label-sm text-label-sm text-white/60">{club.description}</p>
              </div>
            </div>
            <span className="flex items-center gap-xs px-sm py-xs bg-primary/20 rounded-full">
              <Icon name="star" size={14} className="text-primary-fixed" />
              <span className="font-label-sm text-label-sm text-on-primary-container">Primary</span>
            </span>
          </div>
          <div className="mt-md flex gap-sm">
            <div className="flex-1 rounded-2xl bg-white/10 px-sm py-sm">
              <p className="font-label-sm text-label-sm text-white/60">Members</p>
              <p className="font-display-lg text-display-lg text-primary-fixed">{club.member_count}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 px-sm py-sm">
              <p className="font-label-sm text-label-sm text-white/60">Weekly routes</p>
              <p className="font-display-lg text-display-lg text-primary-fixed">42</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 px-sm py-sm">
              <p className="font-label-sm text-label-sm text-white/60">Club rank</p>
              <p className="font-display-lg text-display-lg text-primary-fixed">#3</p>
            </div>
          </div>
        </section>

        {/* Active challenges */}
        <section className="space-y-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">Active challenges</h3>
            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="font-label-md text-label-md text-primary"
            >
              View all
            </button>
          </div>
          <div className="space-y-sm">
            {[
              { title: 'Morning Miles', subtitle: 'Ends in 2 days', pct: 75, icon: 'wb_sunny' },
              { title: 'Weekend Warrior', subtitle: 'Starts tomorrow', pct: 20, icon: 'fitness_center' },
              { title: 'Streak Sprint', subtitle: 'Starts today', pct: 0, icon: 'whatshot' },
            ].map((ch, i) => (
              <div
                key={i}
                className="min-w-[280px] bg-surface-container-lowest soft-border rounded-2xl p-lg space-y-md flex-shrink-0 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-body-lg text-body-lg font-bold text-on-surface">{ch.title}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{ch.subtitle}</p>
                  </div>
                  <Icon name={ch.icon} size={22} className="text-tertiary" />
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span>Progress</span>
                    <span className="text-primary">{ch.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-container transition-all duration-700"
                      style={{ width: `${ch.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Members */}
        <section className="space-y-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">Top members</h3>
            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="font-label-md text-label-md text-primary"
            >
              Full leaderboard
            </button>
          </div>
          <div className="space-y-sm">
            {clubMembers.map((member, i) => (
              <button
                key={member.user_id}
                type="button"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-md p-md bg-surface-container-lowest soft-border rounded-xl cursor-pointer transition hover:shadow-card active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt={member.full_name}
                    src={`https://lh3.googleusercontent.com/aida-public/AB6AXuD${i === 0 ? 'BoOqEyTxeFjzD7Xv4B-2tpfsh_lwoOLha3IqVDg_f3H3Sm5iG1wRNMkO6TIkJ83PBlOUF0fdVWDtoaCyY1JM9uqf4uu3N9_Y7lUYH2hEgislr_0L7H_Z1RbpWksD9pvQBC4XdvDLX8ybLNqJ25e3CUpqSryE3CmHcDkNQlakOSn7nNu24NuYpTSC-xc22nmwG872tiUGeYec9apyotCbB1K2tgKNQFIs7Cyw5OJrB3qQdvHJNwBXDuR01q4UpMyzqWpsqk7JWUHuh' : i === 1 ? 'DGPMAZ7LwisIxVjZiBqElC6B6SMroC5YwSMqcMRgI8W9rD2qCW9oMp31UBeELaiaLl2xBT11QUcMiDC5mjdCDhtngyj8thrrG7oQwTP9cj3nCC7LJvoDjBwsi7d-Rrx06pxqwmPtBq4nSiEG_PLwbwKbpVhN5Ub0OuaDO2LigCOQlIQgdZJ0kWm0G13xOsqW3tN3qYcKRCcAvhPm-LJaSnSpZm9dk2MZxifhkRgTZ68qHS2PL-Vamg3siLEScNl8jqJBEMs4FPDwbq' : 'D2BFEo652vBnNvCkUgWz50QG12n2EUo8T2r6BKGVjoooLNDe8T66XyfqNd-TWWI_A8olzfirH7uOqEsuZyIk-MHhVMt3CRYqPivBAKePA8Slw6PKtuv3Tn_eQi496H31z9wkmwthqQgnrIdGUFSmEXQnf1yX_5X-XRq9ocvricNK1dE-JB9NP_Ajnfjyr9s8N_W2_0pZHDK_C5v2ZcMSr6OcONlmUlPA5enWkmRBsaVj1_v1PxKatfafH0Rx4KdGdEBwGWjkEC7spT'}.JPG`}
                  />
                </div>
                <div className="flex-1 space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {member.full_name}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      #{member.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(member.points / 5000) * 100}%` }}
                      />
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {member.points.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
