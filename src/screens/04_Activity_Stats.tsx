/* eslint-disable */
/**
 * Screen 04 — Activity Stats
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/04_Activity_Stats.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchActivityStats } from '../lib/api';
import type { ActivityStats } from '../lib/types';

/** Bars grow from 0 on mount — mirrors the Stitch chart's entrance motion. */
const BARS = [
  { day: 'M', height: 60, kind: 'bar-mint' },
  { day: 'T', height: 85, kind: 'bar-amber' },
  { day: 'W', height: 45, kind: 'bar-mint' },
  { day: 'T', height: 95, kind: 'bar-mint' },
  { day: 'F', height: 70, kind: 'bar-amber' },
  { day: 'S', height: 30, kind: 'bar-mint' },
  { day: 'S', height: 50, kind: 'bar-mint' },
];

export default function Stitch04_Activity_Stats() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [bars, setBars] = useState(BARS.map(() => 0));

  useEffect(() => {
    fetchActivityStats().then(setStats).catch(() => undefined);
    const t = window.setTimeout(
      () => setBars(BARS.map(bar => bar.height)),
      120
    );
    return () => window.clearTimeout(t);
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';
  return (
    <>


<header className="flex justify-between items-center w-full sticky top-0 z-40 bg-background dark:bg-background px-container-padding pt-md">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer transition active:scale-95" onClick={() => navigate('/profile')}>
<img className="w-full h-full object-cover" alt="A professional headshot of a friendly university student with a warm smile, wearing modern academic attire. The lighting is soft and natural, emphasizing a calm and focused atmosphere. The background is a blurred library setting with warm woody tones and soft mint green accents, consistent with a clean minimalist aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEtX16nNiAvi3xNREXJ1lri0s7MrahiZNSFdVjQAwf-goYXfKWvJZZm-gVQlB69vSazrOMcSSphxf33Lo5WTCejmNp26Md1Auz4xq1-sxr7FeCde_0o8diCt3jDb08FZu21INzM9EtFk4Jz2K9tSdArdMmndVaSBCeSz_Tketk8Ut8NcIj29Awuk6AZQ2cKnsdl0usrKk0dt1FqIO1f_iiY45py1VAht4sjr-ZIi-zpscWegYPMy27MZeDCu42IvbACFLzNfxajS5q"/>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed-dim">Good morning, {firstName}</h1>
</div>
<button onClick={() => navigate('/notifications')} className="material-symbols-outlined text-primary dark:text-primary-fixed-dim hover:opacity-80 transition-opacity active:scale-90" data-icon="notifications">notifications</button>
</header>
<main className="px-container-padding mt-lg space-y-lg">

<section className="space-y-sm">
<div className="flex justify-between items-end">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Weekly Performance</p>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Activity Overview</h2>
</div>
<div className="flex items-center gap-xs text-primary font-label-md">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
<span>Oct 14 - 20</span>
</div>
</div>

<div className="glass-card rounded-xl p-md">
<div className="chart-container pt-md">
{BARS.map((bar, index) => (
<div key={`${bar.day}-${index}`} className="flex flex-col items-center gap-xs">
<div className={bar.kind} style={{ height: `${bars[index]}%` }}></div>
<span className="font-label-sm text-label-sm text-on-surface-variant">{bar.day}</span>
</div>
))}
</div>
<div className="flex gap-md mt-md justify-center">
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-full bg-primary-container"></div>
<span className="font-label-sm text-label-sm">High Intensity</span>
</div>
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-full bg-secondary-container"></div>
<span className="font-label-sm text-label-sm">Recovery</span>
</div>
</div>
</div>
</section>

<section className="grid grid-cols-2 gap-card-gap">
<div className="glass-card rounded-xl p-md flex flex-col justify-between aspect-square">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">local_fire_department</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface-variant">Calories burned</p>
<p className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{(stats?.calories ?? 1240).toLocaleString()} <span className="text-label-sm font-normal">kcal</span></p>
</div>
</div>
<div className="glass-card rounded-xl p-md flex flex-col justify-between aspect-square">
<div className="w-10 h-10 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">schedule</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface-variant">Minutes active</p>
<p className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">{stats?.weekly_active_minutes ?? 342} <span className="text-label-sm font-normal">min</span></p>
</div>
</div>
</section>

<section className="space-y-sm">
<div className="flex justify-between items-center">
<h3 className="font-title-md text-title-md">Recent Workouts</h3>
<button onClick={() => navigate('/explore')} className="text-primary font-label-md hover:underline">View All</button>
</div>
<div className="space-y-sm">

<div className="glass-card rounded-xl p-md flex items-center gap-md group cursor-pointer active:scale-95 transition-transform">
<div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" alt="A serene outdoor university campus scene with a lush green running path winding through ancient oak trees. Soft morning sunlight filters through the leaves, creating a peaceful and energizing atmosphere. The style is bright and minimalist with natural tones, focusing on health and student wellness." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaEgEeYZto49uJ7YjtINoQYadSVDt-8Cwje0gyGF94GmJkSKaC3zuMU9bTUUp1AemCt9jawaJ_9vI8_iOYj9g5lWMRq9-3GUARpabSrRFL8sgJoLH-rQ-Wp87pbaCDIL44Kpyq-hsa3lHICApWzyNxcJOode-JwxexgYaPxTg9h3alg11DV4fH-M9Atd_TxPcspYZyUMLd-qVC-Uy5Dr_MIFsDOh7tBfB90zp9jf4-CaXmNp7Qaj2LG-WmdopszFxyBFlAKXrDSjy1"/>
</div>
<div className="flex-1">
<h4 className="font-title-md text-body-lg font-semibold">Campus Run</h4>
<p className="font-label-md text-label-md text-on-surface-variant">Yesterday • 4.2 km</p>
</div>
<div className="text-right">
<p className="font-label-md font-bold text-primary">24m</p>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
</div>

<div className="glass-card rounded-xl p-md flex items-center gap-md group cursor-pointer active:scale-95 transition-transform">
<div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" alt="A minimalist high-end university gym interior featuring sleek modern equipment and large windows looking out onto a bright green courtyard. The space is clean, organized, and illuminated by soft, diffused light, evoking a sense of focused energy and athletic discipline in a calm academic setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh5lqGiW8VkiQ6-4Juhtjp-MATRNM55opVp7IPCNjuCO0eVQqeeBFpt8fxECldOW2cy5FijwWEePLgO9KF-ydFtG6hmeKVUa7PT51l7EDt32_mteqE5cRxlYDPtHAYVY3CDpDUNMYU_lqT5xSsGxbpaAmUoyLvyuSgWB4WoStur2ilc4QAIfrDIBu_tMf3Kd8-78CodBrayTHJmPftn3-Uq_0IXqseuo3I5NPVlLNLvJccIXctMoE3HsS9aHKmMWG0mKz-mly2iYBf"/>
</div>
<div className="flex-1">
<h4 className="font-title-md text-body-lg font-semibold">Morning Yoga</h4>
<p className="font-label-md text-label-md text-on-surface-variant">Oct 18 • Mindfulness</p>
</div>
<div className="text-right">
<p className="font-label-md font-bold text-secondary">45m</p>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
</div>

<div className="glass-card rounded-xl p-md flex items-center gap-md group cursor-pointer active:scale-95 transition-transform">
<div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" alt="A wide-angle shot of a modern architectural stairwell in a university building, characterized by clean lines and natural wood textures. A student is captured in a blurred motion of walking up the stairs, symbolizing daily activity and movement within a sophisticated minimalist academic environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEIg3m1f5lQw7mnOhrkgnV-XoxzDBdqf3alUwI3qdan2zmJGowyyS7MNrVusrS4j7R8FDP7kC7Q21MIyyWGvZwXNwOk63o81Dr0xcAA_bm2h72Uc-eGOU2HSCyUi08MbxhzEC_pdy4unMNa-rIQz4WKI-BDF42gK4aH9wzKuj-vAw7K0p-mBRA__RFRryQgjYSc0QDy2TrVXlmoiZdNDiXzt6PGxXla2rZbEQAFS6EleS2YyVsr3F0TdVflMeEZqqDmZIzm_Jbi-7h"/>
</div>
<div className="flex-1">
<h4 className="font-title-md text-body-lg font-semibold">Stair Climb</h4>
<p className="font-label-md text-label-md text-on-surface-variant">Oct 17 • Cardio</p>
</div>
<div className="text-right">
<p className="font-label-md font-bold text-primary">15m</p>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
</div>
</div>
</section>
</main>


    </>
  );
}
