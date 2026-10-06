/* eslint-disable */
/**
 * Screen 01 — Student Dashboard
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/01_Student_Dashboard.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchActivityStats } from '../lib/api';
import type { ActivityStats } from '../lib/types';

export default function Stitch01_Student_Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [ringOffset, setRingOffset] = useState(440); // start fully empty, then animate

  useEffect(() => {
    fetchActivityStats().then(setStats).catch(() => undefined);
  }, []);

  useEffect(() => {
    const pct = stats ? Math.min(1, stats.steps / stats.step_goal) : 0;
    const t = window.setTimeout(() => setRingOffset(440 * (1 - pct)), 300);
    return () => window.clearTimeout(t);
  }, [stats]);

  const steps = stats?.steps ?? 7420;
  const goalPct = Math.round((steps / (stats?.step_goal ?? 10000)) * 100);
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';
  return (
    <>


<header className="flex justify-between items-center w-full sticky top-0 z-40 bg-background dark:bg-background px-container-padding pt-md pb-xs">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container cursor-pointer transition active:scale-95" onClick={() => navigate('/profile')}>
<img className="w-full h-full object-cover" alt="A warm, professional headshot of a diverse university student smiling gently, lit by soft natural morning sunlight. The background is a slightly blurred modern university campus with hints of lush greenery and warm brickwork. The image has a clean, high-resolution minimalist aesthetic, fitting a student wellness application with soft, approachable tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3VdBU9RnE7nvFcNWBbedgDfGrP5LQmcMXv_FwsKsvsvAKMknwBYi4jtJono83bif8RBHl87ux9WJnX3KDrTFYf8tAHffqg4cTtKW-yuELi2tMajF3YZ1Q7MzaZIgvUDGvLdNl2kJ_RSRIC8Gis_nBEusntcfRf7_7qYRoKONF0nDVAsLZ3PS9_egsPE33GnQKzFCFwC0QeiSszpkZZI6w4V7q5jdI1lzMtZgI7hU4jtHp3TbOJucP6Tvsq3rOhe7kpusKqAsmpjj0"/>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed-dim">Good morning, {firstName}</h1>
</div>
<button onClick={() => navigate('/notifications')} className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface hover:opacity-80 transition-opacity active:scale-90 transition-transform">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest"></span>
</button>
</header>
<main className="px-container-padding space-y-lg mt-md">

<section className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">

<div className="bg-surface-container-lowest border border-black/5 rounded-card p-lg flex flex-col items-center justify-center text-center custom-shadow">
<div className="relative w-40 h-40">
<svg className="w-full h-full transform -rotate-90">
<circle className="text-surface-container-high" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-primary-container circular-progress" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={ringOffset} strokeLinecap="round" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-display-lg text-display-lg text-on-background">{steps.toLocaleString()}</span>
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Steps</span>
</div>
</div>
<div className="mt-md">
<p className="font-body-md text-body-md text-on-surface-variant">{goalPct}% of your 10k daily goal</p>
</div>
</div>

<div className="bg-surface-container-lowest border border-black/5 rounded-card p-lg flex flex-col justify-between custom-shadow">
<div>
<div className="flex items-center gap-xs mb-xs">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
<span className="font-label-sm text-label-sm text-secondary uppercase">Next Class</span>
</div>
<h2 className="font-title-md text-title-md text-on-background mb-base">HIIT &amp; Flow</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Student Rec Center • Studio B</p>
</div>
<div className="mt-lg">
<div className="flex items-center gap-sm mb-md">
<div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-on-secondary-fixed">timer</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface">Starting in 45 mins</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Don't forget your water bottle!</p>
</div>
</div>
<button onClick={() => navigate('/stats')} className="w-full py-sm bg-primary text-on-primary rounded-full font-label-md hover:opacity-90 active:scale-95 transition-all">
                        View Schedule
                    </button>
</div>
</div>
</section>

<section className="space-y-md">
<div className="flex justify-between items-end">
<div>
<h3 className="font-title-md text-title-md text-on-background">Top FitTrips</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Popular routes this week</p>
</div>
<button onClick={() => navigate('/explore')} className="text-tertiary font-label-md">View all</button>
</div>
<div className="flex gap-md overflow-x-auto pb-md snap-x -mx-container-padding px-container-padding no-scrollbar">

<div onClick={() => navigate('/explore/map')} className="min-w-[280px] snap-start bg-surface-container-lowest border border-black/5 rounded-card overflow-hidden custom-shadow group cursor-pointer transition hover:shadow-card-lg active:scale-[0.99]">
<div className="h-40 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="A cinematic, wide-angle photo of a scenic jogging path through a sun-drenched university campus park. Golden hour light filters through large oak trees onto a clean asphalt trail that curves around a calm pond. The atmosphere is peaceful, healthy, and vibrant, featuring the soft warm cream and mint green tones of the design system." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRUtdwK6G6WPQBmIFggCUuj0uOj-GftdxFAjxlwn8AshxiuVanlfI3OWO67S-BEyVMDBdqHuRlF6hdgFeWGy_q2-JTXtk2j60zfEe7Ja6xnMMpXuyu6dXo5kpNWdZnL47z_oH2bJ3SWOmg8jlpo-bW4dYHhlVCeTQVaRyXg6B0KW2sC-HnZtwOAy8Mt0udG9lMoSirzwTqLwoMwpK8f9_Kr0c7HVaI38s3ofgs51B22VCDTmSgnbmG9lUgO69SRXF2wCFLIB8Gb2Us"/>
<div className="absolute top-sm right-sm bg-tertiary-container text-on-tertiary-container px-sm py-xs rounded-full font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">groups</span> 1.2k
                        </div>
</div>
<div className="p-md bg-white">
<h4 className="font-title-md text-title-md text-on-background">Sunset Lake Loop</h4>
<div className="flex items-center gap-sm mt-xs">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">distance</span>
<span className="font-label-md text-label-md">4.2 km</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
<span className="font-label-md text-label-md">Easy</span>
</div>
</div>
</div>
</div>

<div onClick={() => navigate('/explore/map')} className="min-w-[280px] snap-start bg-surface-container-lowest border border-black/5 rounded-card overflow-hidden custom-shadow group cursor-pointer transition hover:shadow-card-lg active:scale-[0.99]">
<div className="h-40 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="An aerial view of a vibrant city park trail at dusk, with soft purple and blue ambient lighting highlighting a paved fitness track. Modern architectural campus buildings are visible in the distance, glowing with warm interior lights. The scene is clean, safe, and motivating, embodying a premium wellness aesthetic with high-end photography quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlUs9MNeMXw0hTQoP-gbVnPEUcCNemAn4v9sYGotow8B36PQVUKHG7a5gzN9ocOUjQs_I7-WaQkAd2FMJFg7-LC_jluleZto_loM1YFbCm0oJtuUjyEiR7yX6mKihlaHbhmBDD7zHcUDuz8fc4e56rPhzDMR3N_Pe9rvKXzDN6lJ9ILAOiZNuaNyWUlj4rnWiYa8i2n8Q9RZghCbgb-n0fQgR449ti3V-SRn0YrEzdUY0DxKnLlVIITs1FDfyVMMVBErtfFF8MZa4r"/>
<div className="absolute top-sm right-sm bg-tertiary-container text-on-tertiary-container px-sm py-xs rounded-full font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">groups</span> 840
                        </div>
</div>
<div className="p-md bg-white">
<h4 className="font-title-md text-title-md text-on-background">The Quad Sprint</h4>
<div className="flex items-center gap-sm mt-xs">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">distance</span>
<span className="font-label-md text-label-md">2.8 km</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
<span className="font-label-md text-label-md">Medium</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="grid grid-cols-2 gap-card-gap">
<div className="bg-primary-container/10 border border-primary/5 rounded-card p-md custom-shadow">
<span className="material-symbols-outlined text-primary mb-xs">bolt</span>
<p className="font-label-sm text-label-sm text-primary uppercase">Active Time</p>
<p className="font-title-md text-title-md text-on-primary-container">{stats?.active_minutes ?? 52}m <span className="text-body-md font-normal">/ {stats?.active_goal ?? 60}m</span></p>
</div>
<div className="bg-tertiary-container/10 border border-tertiary/5 rounded-card p-md custom-shadow">
<span className="material-symbols-outlined text-tertiary mb-xs">favorite</span>
<p className="font-label-sm text-label-sm text-tertiary uppercase">Avg Heart Rate</p>
<p className="font-title-md text-title-md text-on-tertiary-container">{stats?.heart_rate ?? 72} <span className="text-body-md font-normal">bpm</span></p>
</div>
</section>
</main>


    </>
  );
}
