/* eslint-disable */
/**
 * Screen 14 — FitTrip Explorer Search
 * Ported from the Google Stitch export
 * (_campusfit_screens/14_FitTrip_Explorer_Search.html) and made fully
 * interactive: live search, category filters, join/follow toggles.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { fetchFitTrips } from '../lib/api';
import type { FitTrip } from '../lib/types';

const CHIPS = ['All', 'Clubs', 'Routes', 'Students', 'Trends'] as const;
type Chip = (typeof CHIPS)[number];

const CLUBS = [
  { name: 'Dawn Runners', members: 124, icon: 'directions_run', tone: 'bg-primary-fixed-dim', iconTone: 'text-on-primary-container' },
  { name: 'Zen Yoga', members: 89, icon: 'self_improvement', tone: 'bg-tertiary-fixed-dim', iconTone: 'text-on-tertiary-container' },
  { name: 'Lifting Lions', members: 210, icon: 'fitness_center', tone: 'bg-secondary-fixed-dim', iconTone: 'text-on-secondary-fixed-variant' },
  { name: 'Campus Cycle', members: 56, icon: 'pedal_bike', tone: 'bg-primary-fixed-dim', iconTone: 'text-on-primary-container' },
];

const STUDENTS = [
  { name: 'Alex Chen', meta: 'North Loop Crew • 5km today', initiallyFollowing: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuqgUfdPDxeJYDxKW81WwD0Op2yxpyHgMnx5Zg9MyH7UZeQ7LSW6xhpc9LFgt9m7Cltj3I3ouENOqGT81scH5Sd7OfRxyz9cIzktOPmaiewM8m_7VJcsyiEJaAJIUBoGcln_WjYwpJcdmPrnDUZ_iz_yrQtNq-ClfnOtoT_xeh1sdbVivsd-iNEPzrPPvZ1vgIzPMsM1ja_yOsWiT8ewhdnctno7Dd96Tc_hsEoLMG-ovGiTPdP0FEU6N_VtMfJA1Gmz-OCxfJZPru' },
  { name: 'Sarah Miller', meta: 'Zen Yoga • 30m mindful flow', initiallyFollowing: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKBwXsZyrlzyCICuNmZzDmRRAmTxW78bHZTqlNop8SeNDlXuBwmatgagveWUNNb0ZEBv1qprWOpt6WES6SVMGCrMEY0PMr2oSfZwzXAEraE7Ixq9GtHjmHDF4n52TCGvp4BHljkfnMxWZ825wmqYzEoF1NP0YN3l0C0LVFyPPZfON9Dev6N-qLsPQ1YcdTwYNPc-rLDKBG3wYf4NXoYmUNvNgXCg6CayVP9ZmgybLBWMB5hT4BdWdFSOumS2ufCgswWF77kHa9hnAc' },
  { name: 'Jordan Reed', meta: 'Lifting Lions • Heavy Day', initiallyFollowing: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxTSUc003iF2LqECATksYHA5KyZPxWjXxcAv7Kv4Cqtr_f6d-5gY-hl29EftPEMLJdaGiiajsli8gAqrGNC-5NNzZehifIZlj6OaDl-gi2-0Q-de589d5HYLz4BO4SBE1OYo1zMZAOoJrYUWF5BO1pXzZRMb3avO8ukkooG1GFlhNIImty8e6FScGDSKy1AB80WyNef3Wvprl-ZcUOu2_w7hK8VBtSalGtXq0LuJvPVwdPyGy8Qp8bAP2x_zKoNoM-hUHSwWw-yea-' },
];

export default function Stitch14_FitTrip_Explorer_Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<Chip>('All');
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>(
    Object.fromEntries(STUDENTS.map(s => [s.name, s.initiallyFollowing]))
  );
  const [routes, setRoutes] = useState<FitTrip[]>([]);

  useEffect(() => {
    fetchFitTrips().then(setRoutes).catch(() => setRoutes([]));
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);

  const showClubs = chip === 'All' || chip === 'Clubs' || chip === 'Trends';
  const showStudents = chip === 'All' || chip === 'Students';
  const showRoutes = chip === 'Routes';

  const clubs = useMemo(() => CLUBS.filter(c => matches(c.name)), [q]);
  const students = useMemo(() => STUDENTS.filter(s => matches(s.name)), [q]);
  const trips = useMemo(() => routes.filter(t => matches(t.name)), [q, routes]);

  const nothing = (() => {
    const visibleCounts: number[] = [];
    if (showRoutes) visibleCounts.push(trips.length);
    if (showClubs) visibleCounts.push(clubs.length);
    if (showStudents) visibleCounts.push(students.length);
    return visibleCounts.length > 0 && visibleCounts.every(count => count === 0);
  })();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF5EE] bg-opacity-95 backdrop-blur-sm px-container-padding py-xs flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => navigate('/explore')}
            aria-label="Back to explorer"
            className="material-symbols-outlined text-primary active:scale-90 transition-transform"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            menu
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">Explore</h1>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer transition active:scale-95"
        >
          <img
            className="w-full h-full object-cover"
            alt="A professional studio headshot of a diverse university student with a warm, friendly expression. The lighting is soft and natural, emphasizing a calm and supportive campus atmosphere. The background is a clean, neutral minimalist gym setting with mint and cream accents, matching the CampusFit aesthetic."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRlDqNrTwNuMbDam1cQdyZS7Int3v715rMakQjKhR02z-BPDpY4eV4BIlVmbNnruGuTuu-sohWsB-TI-wu877FzP0BAtHGLurfYPJSAbMAvWu8LB5l_syJ3-NYi-yDpB674AI-DPSpfJGVMY8RlPtf1rrVUxHYZ91PxFJn3jvfJpB-O3uZnJEOvbDDh88w88t0EiMZCkn2AIc6M4rX950JksyCWDZdpM4vGdl9H7bZZFW72G83ejEKAKY7IA_3PChPwFxcaS9SC4xe"
          />
        </div>
      </header>

      <div className="px-container-padding mt-sm">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>
            search
          </span>
          <input
            className="w-full h-14 pl-12 pr-12 bg-surface-container-lowest border border-outline-variant rounded-full text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all shadow-sm"
            placeholder="Search routes, clubs, students…"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-4 material-symbols-outlined text-outline hover:text-primary transition-colors"
            >
              close
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-sm px-container-padding mt-lg overflow-x-auto hide-scrollbar py-2">
        {CHIPS.map(label => (
          <button
            key={label}
            onClick={() => setChip(label)}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-label-md text-label-md transition-colors ${
              chip === label
                ? 'bg-inverse-surface text-surface-container-lowest'
                : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-variant/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mt-xl px-container-padding">
        <div className="flex items-center justify-between mb-md">
          <h2 className="font-title-md text-title-md text-on-surface">
            {chip === 'Routes' ? 'Popular routes' : 'Trending clubs'}
          </h2>
          <button onClick={() => navigate('/clubs')} className="text-primary font-label-md text-label-md">
            See all
          </button>
        </div>

        {showRoutes ? (
          <div className="grid grid-cols-2 gap-card-gap">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate('/explore/map')}
                className="kinetic-card bg-surface-container-lowest p-md rounded-xl border border-black/5 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-primary-fixed-dim flex items-center justify-center mb-sm">
                  <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    route
                  </span>
                </div>
                <h3 className="font-title-md text-label-md text-on-surface mb-base">{trip.name}</h3>
                <p className="text-on-surface-variant font-label-sm text-label-sm mb-md">
                  {trip.distance_km} km · {trip.difficulty}
                </p>
                <button className="w-full py-1.5 bg-secondary-container text-on-secondary-fixed font-label-md text-label-sm rounded-full active:scale-95 transition-transform">
                  Start
                </button>
              </div>
            ))}
          </div>
        ) : (
          showClubs && (
            <div className="grid grid-cols-2 gap-card-gap">
              {clubs.map(club => {
                const isJoined = Boolean(joined[club.name]);
                return (
                  <div
                    key={club.name}
                    onClick={() => navigate('/clubs')}
                    className="kinetic-card bg-surface-container-lowest p-md rounded-xl border border-black/5 flex flex-col items-center text-center cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-full ${club.tone} flex items-center justify-center mb-sm`}>
                      <span className={`material-symbols-outlined ${club.iconTone}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {club.icon}
                      </span>
                    </div>
                    <h3 className="font-title-md text-label-md text-on-surface mb-base">{club.name}</h3>
                    <p className="text-on-surface-variant font-label-sm text-label-sm mb-md">
                      {club.members + (isJoined ? 1 : 0)} members
                    </p>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setJoined(prev => ({ ...prev, [club.name]: !isJoined }));
                      }}
                      className={`w-full py-1.5 font-label-md text-label-sm rounded-full active:scale-95 transition-all ${
                        isJoined
                          ? 'bg-surface-variant text-on-surface-variant'
                          : 'bg-secondary-container text-on-secondary-fixed'
                      }`}
                    >
                      {isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </section>

      {showStudents && (
        <section className="mt-xl px-container-padding pb-8">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-title-md text-title-md text-on-surface">Students near you</h2>
            <button onClick={() => navigate('/leaderboard')} className="text-primary font-label-md text-label-md">
              See all
            </button>
          </div>
          <div className="space-y-sm">
            {students.map(student => {
              const isFollowing = Boolean(following[student.name]);
              return (
                <div
                  key={student.name}
                  className="kinetic-card flex items-center justify-between p-md bg-surface-container-lowest rounded-xl border border-black/5"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img className="w-full h-full object-cover" alt={student.name} src={student.img} />
                    </div>
                    <div>
                      <h4 className="font-title-md text-label-md text-on-surface">{student.name}</h4>
                      <p className="text-on-surface-variant font-label-sm text-label-sm">{student.meta}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFollowing(prev => ({ ...prev, [student.name]: !isFollowing }))}
                    className={`px-5 py-1.5 font-label-md text-label-sm rounded-full transition-all active:scale-95 ${
                      isFollowing
                        ? 'bg-surface-variant text-on-surface-variant'
                        : 'bg-primary-container text-on-primary-container'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {nothing && (
        <div className="px-container-padding pb-8">
          <EmptyState
            icon="search_off"
            title="Nothing found"
            message={`No results for “${query}”. Try another route, club or student.`}
          />
        </div>
      )}
    </>
  );
}
