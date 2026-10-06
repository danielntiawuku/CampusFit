/* eslint-disable */
/**
 * Screen 03 — FitTrip Explorer
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/03_FitTrip_Explorer.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FILTERS = [
  { label: 'Main Loop', icon: 'directions_run', fill: true },
  { label: 'Arboretum', icon: 'forest', fill: false },
  { label: 'The Ridge', icon: 'bike_dock', fill: false },
];

export default function Stitch03_FitTrip_Explorer() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(0);
  return (
    <>


<header className="flex justify-between items-center w-full sticky top-0 z-40 bg-[#FAF5EE]/80 backdrop-blur-md px-container-padding pt-md pb-xs">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer transition active:scale-95" onClick={() => navigate('/profile')}>
<img className="w-full h-full object-cover" alt="A friendly close-up portrait of a diverse university student with a bright, welcoming smile, set against a soft-focus campus background in morning golden hour light. The image has a clean, professional aesthetic with high-key lighting and natural textures that align with a modern wellness brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw3RCt-oz53N2yFhxEoNiNuPs7BCKR9EVzzDMbd97O67uQTYCYMxdMNBNTTff68q86DUUtqJTWrNiZjSmlVC_FdOwRGqdkIHZobRg4nTtkrTX0L-a2H7FXvxP0Qa9DObxFEoSKor0g12TUlnmQ4xVTpxMFEQGyccEbG85LeV_FVUyyxt-562yv7Xq_aXjvaHD3jBjfspWC2Gd-bO8L8jvejD8G8on8zNMgPsu3aHVPJqIsffFb01KUAhhkqge4whx_B-ksFu7ivi7X"/>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">FitTrip</h1>
</div>
<button onClick={() => navigate('/notifications')} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:opacity-80 transition-opacity active:scale-90">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
</button>
</header>

<main className="flex-1 relative w-full overflow-hidden">

<div className="absolute inset-0 z-0">
<div className="w-full h-full bg-cover bg-center transition-transform duration-[20s] scale-110 animate-pulse-slow" data-alt="A sophisticated, minimalist map view of a university campus featuring elegant winding running trails highlighted in a glowing purple accent. The map uses a warm cream and soft grey palette with subtle architectural outlines of campus buildings. The overall feel is clean, serene, and invites exploration with a modern digital interface aesthetic." data-location="Stanford University" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPnaEJTDDJ-gn6Ib1nAXZsNyvJp4a2xpSmtMXrR-_IAJVm8iPiecEhAuzMj04lk8e6rjB86RDOUTy3GEjg-A9yjZoQmutUh7DV8VvlPBbZuFmIhMC3XhM3SYCeUnGIrUOrx-HjJNDc4ykHpAPsr3vMj7zt9x3A7_pv6AcmEAmUP6RXdtqqxHxQsJFIVXl_h5UoINi1rh6MJoJybug2O6gusqooqnrIbPi6bfJoihbxh2S7TH0YV2ui7PwpfRlIU1659lgmj3cFyi5z')" }}></div>
<div className="absolute inset-0 map-gradient-overlay pointer-events-none"></div>
</div>

<div className="absolute inset-0 z-10 pointer-events-none">

<div onClick={() => navigate('/explore/map')} className="absolute top-[30%] left-[25%] pointer-events-auto group cursor-pointer">
<div className="relative flex flex-col items-center">
<div className="w-12 h-12 rounded-full border-4 border-surface-container-lowest shadow-lg overflow-hidden transition-transform group-hover:scale-110">
<img className="w-full h-full object-cover" alt="A profile photo of a young male student athlete in running gear, smiling confidently towards the camera. The lighting is warm and sun-drenched, emphasizing a healthy and active lifestyle. The background is a soft blur of green park space, matching the warm minimalist aesthetic of the wellness app." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT53-bBV_FRnS6qNAp8BbfqKVz8yosu1J1Wo3VLiuAUIkq9oxmarf5KTf4PTNjVQaUmPcv0q04SFV8mWHoB7vE-JxWSQfUq_8TiAdhq4bx2wHaSkMRGfm1Koi72y1ntannrw9KFSFVDAAZ86Sb_-KXZ0qvQv6Eh_3eVOmLpRFIiyJjrP6aXyY5gUgY5Esyi9XEQsg0eoVU6zLS87bbIY6SzSWMhRDP29aDz3fJDswhHpAfR62k3a64mn_rTZ_eaa6hdKgsd6yC8ElX"/>
</div>
<div className="mt-xs px-sm py-base bg-surface-container-lowest rounded-full shadow-sm">
<span className="text-label-sm text-primary font-bold">Leo • 2m ago</span>
</div>
</div>
</div>

<div onClick={() => navigate('/explore/map')} className="absolute top-[55%] right-[20%] pointer-events-auto group cursor-pointer">
<div className="relative flex flex-col items-center">
<div className="w-12 h-12 rounded-full border-4 border-surface-container-lowest shadow-lg overflow-hidden transition-transform group-hover:scale-110">
<img className="w-full h-full object-cover" alt="A close-up portrait of a female student with braided hair, wearing stylish athletic apparel. She is outdoors on a track, looking motivated and fresh. The image is captured with a high-end digital feel, using soft pastel tones and natural morning light to create a supportive, minimalist atmosphere." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8y0wp-fqusmfeAH6QE8J3k4JoJ48Oh_B5DfM7xvmoDDDv-21M3UCTJNunOJ8iSLYR5562i8jX7paitKrXIqWucvHiCG7dcwmjITWWaJSW69AW5sMNKFASQyxIu3181l8QllWVhz7krdI6kWNwSPPEobaZlw0dfE8aqZp8Vo6L5IrMZyj9YHKxRKwOUb5XZw_nnjJFXpwh_Osg-mrNUN9Nx05ue169yNEhUvAWg1jZRb8KRY6QVUq1X4lMoI6JodtsVpMmUlYIv369"/>
</div>
<div className="mt-xs px-sm py-base bg-surface-container-lowest rounded-full shadow-sm">
<span className="text-label-sm text-primary font-bold">Maya • Just now</span>
</div>
</div>
</div>

<div onClick={() => navigate('/clubs')} className="absolute top-[42%] left-[55%] pointer-events-auto group cursor-pointer">
<div className="flex flex-col items-center animate-bounce">
<div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center shadow-lg shadow-accent-purple/40">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
</div>
<div className="mt-xs glass-panel px-md py-sm rounded-xl border border-white/20 shadow-xl">
<p className="text-label-md font-bold text-on-tertiary-fixed-variant">Campus Meetup</p>
<p className="text-[10px] text-on-tertiary-fixed-variant/70 uppercase tracking-widest font-bold">5 Friends Here</p>
</div>
</div>
</div>
</div>

<div className="absolute top-md left-container-padding right-container-padding z-20 flex flex-col gap-sm">

<div onClick={() => navigate('/explore/search')} className="w-full glass-panel h-14 rounded-2xl flex items-center px-md border border-white/30 shadow-md cursor-text transition hover:shadow-lg">
<span className="material-symbols-outlined text-on-surface-variant mr-sm">search</span>
<input className="bg-transparent border-none focus:ring-0 w-full font-body-md text-on-background placeholder:text-on-surface-variant/60" placeholder="Find a route or friend..." type="text"/>
<span className="material-symbols-outlined text-on-surface-variant">tune</span>
</div>

<div className="flex gap-xs overflow-x-auto pb-xs no-scrollbar">
{FILTERS.map((filter, index) => (
<button
key={filter.label}
onClick={() => setActiveFilter(index)}
className={`shrink-0 px-md py-sm rounded-full flex items-center gap-xs shadow-sm active:scale-95 transition-transform ${
  activeFilter === index
    ? 'glass-panel border border-accent-purple/20'
    : 'bg-surface-container-lowest border border-transparent'
}`}
>
<span className={`material-symbols-outlined text-sm ${activeFilter === index ? 'text-accent-purple' : 'text-primary'}`} style={{ fontVariationSettings: `'FILL' ${filter.fill && activeFilter === index ? 1 : 0}` }}>{filter.icon}</span>
<span className="text-label-md font-bold text-on-surface">{filter.label}</span>
</button>
))}
</div>
</div>

<div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30">
<button onClick={() => navigate('/scan')} className="flex items-center gap-sm bg-accent-purple text-white px-xl py-md rounded-full shadow-2xl shadow-accent-purple/50 active:scale-90 transition-transform duration-300">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
<span className="font-title-md font-bold whitespace-nowrap">Start FitTrip</span>
</button>
</div>
</main>


    </>
  );
}
