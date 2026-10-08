/* eslint-disable */
/**
 * Screen 11 — Onboarding Interests
 * Ported from the Google Stitch export
 * (_campusfit_screens/11_Onboarding_Interests.html); interactivity is wired to
 * the app: interests are selectable, persisted to the profile, and the screen
 * exits to the dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../lib/api';

const INTERESTS = [
  { id: 'stay_fit', label: 'Stay fit', icon: 'fitness_center', tone: 'primary' },
  { id: 'meet_people', label: 'Meet new people', icon: 'groups', tone: 'secondary' },
  { id: 'compete', label: 'Compete on leaderboards', icon: 'emoji_events', tone: 'tertiary' },
  { id: 'join_club', label: 'Join a club', icon: 'hub', tone: 'primary' },
  { id: 'explore', label: 'Explore campus', icon: 'map', tone: 'secondary' },
  { id: 'track', label: 'Track my progress', icon: 'analytics', tone: 'tertiary' },
] as const;

const TONE: Record<string, string> = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary-container/20 text-secondary',
  tertiary: 'bg-tertiary-container/20 text-tertiary',
};

export default function Stitch11_Onboarding_Interests() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  async function finish() {
    if (profile) {
      try {
        await updateProfile(profile.id, { interests: selected });
      } catch {
        /* non-fatal — onboarding still completes */
      }
    }
    navigate('/home', { replace: true });
  }

  return (
    <>


<header className="w-full px-container-padding pt-lg flex justify-between items-center bg-transparent">

<div className="flex gap-xs">
<div className="w-8 h-1.5 rounded-full bg-primary-container"></div>
<div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
<div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
</div>

<button onClick={() => navigate('/home', { replace: true })} className="font-label-md text-label-md text-on-surface-variant hover:opacity-70 transition-opacity">
            Skip
        </button>
</header>
<main className="flex-1 w-full max-w-md px-container-padding pt-xl flex flex-col">

<section className="mb-xl">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-tight">
                What brings you to CampusFit?
            </h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-sm">
                Tailor your university fitness experience to your goals.
            </p>
</section>

<section className="grid grid-cols-2 gap-card-gap pb-xl">
{INTERESTS.map(it => {
    const on = selected.includes(it.id);
    return (
<button
    key={it.id}
    type="button"
    onClick={() => toggle(it.id)}
    aria-pressed={on}
    className={`selection-card cursor-pointer flex flex-col gap-sm rounded-xl p-md text-left shadow-sm transition-all border ${on ? 'border-primary-container bg-primary-container/5 ring-2 ring-primary-container/30' : 'border-black/[0.05] bg-surface-container-lowest'}`}
>
<div className={`w-10 h-10 rounded-full flex items-center justify-center ${TONE[it.tone]}`}>
<span className="material-symbols-outlined">{it.icon}</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">{it.label}</span>
</button>
    );
})}
</section>
</main>

<footer className="w-full max-w-md px-container-padding pb-xl mt-auto">
<button onClick={finish} disabled={selected.length === 0} className={`w-full h-14 font-label-md text-body-md rounded-full shadow-lg shadow-primary/5 transition-all duration-300 flex items-center justify-center ${selected.length > 0 ? 'bg-primary-container text-on-primary-container' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`} id="continue-btn">
            Continue
        </button>
</footer>


    </>
  );
}
