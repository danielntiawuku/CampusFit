/* eslint-disable */
/**
 * Screen 17 — Settings
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/17_Settings.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Stitch17_Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [units, setUnits] = useState<'km' | 'mi'>(() =>
    (localStorage.getItem('campusfit-units') as 'km' | 'mi' | null) ?? 'km'
  );
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('campusfit-theme', dark ? 'dark' : 'light');
  }, [dark]);

  function pickUnits(next: 'km' | 'mi') {
    setUnits(next);
    localStorage.setItem('campusfit-units', next);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <>


<header className="flex justify-between items-center w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md px-container-padding pt-md pb-md">
<div className="flex items-center gap-md">
<button onClick={() => navigate(-1)} className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-90 transition-transform">arrow_back</button>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background">Settings</h1>
</div>
<div onClick={() => navigate('/edit-profile')} className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden shadow-sm cursor-pointer transition active:scale-95">
<img className="w-full h-full object-cover" alt="A professional studio headshot of a smiling university student in their early twenties, wearing a modern green athletic quarter-zip. The background is a clean, neutral academic setting with soft bokeh. The lighting is bright and even, highlighting a healthy, energetic glow consistent with a wellness app persona." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO26CuVJFeMjxcDKJJoUV8d20YSYPLK03FTp2vElvm0DxjBRIA6oESXDvM35DnQirriX5PJaQ9JZT6lAvq4MvG1kiwyWxLw6aaWWJHEYFqtaXs8o2cmJxz0IhZdfXVtWA0_S7faY5pJd8-dm9HFO9mKgkZ8eyKh93v7cgjrFO1o34jE8ixbG00jM07CMyqZV1-76iCLQKHTZjUGNsE7V85Otd9tYUXS-WQpOld_Dlsp-qbtp6OyOyJp0zIXE7W1GXv3LFeG-zRWJ0n"/>
</div>
</header>
<main className="px-container-padding space-y-lg mt-md">

<section className="space-y-sm">
<h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant px-base">Account</h2>
<div className="bg-surface-container-lowest rounded-xl border border-black/5 overflow-hidden shadow-sm">

<button onClick={() => navigate('/edit-profile')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">person</span>
<span className="font-body-md text-on-surface">Edit profile</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>

<button onClick={() => navigate('/forgot-password')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">lock</span>
<span className="font-body-md text-on-surface">Change password</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>

<button onClick={() => navigate('/verify')} className="w-full flex items-center justify-between p-md active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
<span className="font-body-md text-on-surface">Student verification status</span>
</div>
<div className="flex items-center gap-xs">
<span className="bg-primary-container/20 text-primary px-xs py-[2px] rounded-full text-label-sm font-bold">Verified</span>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</div>
</button>
</div>
</section>

<section className="space-y-sm">
<h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant px-base">Preferences</h2>
<div className="bg-surface-container-lowest rounded-xl border border-black/5 overflow-hidden shadow-sm">

<div className="flex items-center justify-between p-md border-b border-surface-variant/30">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
<span className="font-body-md text-on-surface">Dark mode</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only ios-toggle" id="dark-mode-toggle" type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/>
<div className="w-11 h-6 bg-surface-variant rounded-full ios-toggle-bg transition-colors duration-200"></div>
<div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm ios-toggle-dot transition-transform duration-200"></div>
</label>
</div>

<div className="flex items-center justify-between p-md border-b border-surface-variant/30">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">straighten</span>
<span className="font-body-md text-on-surface">Units</span>
</div>
<div className="flex bg-surface-container p-[2px] rounded-lg">
<button onClick={() => pickUnits('km')} className={`px-md py-xs rounded-md text-label-md transition-colors ${units === 'km' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`} id="km-btn">km</button>
<button onClick={() => pickUnits('mi')} className={`px-md py-xs rounded-md text-label-md transition-colors ${units === 'mi' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`} id="mi-btn">miles</button>
</div>
</div>

<button onClick={() => navigate('/notifications')} className="w-full flex items-center justify-between p-md active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="font-body-md text-on-surface">Notification preferences</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
</div>
</section>

<section className="space-y-sm">
<h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant px-base">Privacy</h2>
<div className="bg-surface-container-lowest rounded-xl border border-black/5 overflow-hidden shadow-sm">
<button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">visibility</span>
<span className="font-body-md text-on-surface">Who can see my FitTrips</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
<button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
<span className="font-body-md text-on-surface">Profile visibility</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
<button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-md active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">block</span>
<span className="font-body-md text-on-surface">Blocked users</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
</div>
</section>

<section className="space-y-sm">
<h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant px-base">Support</h2>
<div className="bg-surface-container-lowest rounded-xl border border-black/5 overflow-hidden shadow-sm">
<button onClick={() => navigate('/help')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">help</span>
<span className="font-body-md text-on-surface">Help &amp; FAQ</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
<button onClick={() => navigate('/report')} className="w-full flex items-center justify-between p-md border-b border-surface-variant/30 active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">support_agent</span>
<span className="font-body-md text-on-surface">Contact support</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
<button onClick={() => navigate('/report')} className="w-full flex items-center justify-between p-md active:bg-surface-container transition-colors group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">feedback</span>
<span className="font-body-md text-on-surface">Send feedback</span>
</div>
<span className="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform">chevron_right</span>
</button>
</div>
</section>

<div className="flex justify-center pt-lg pb-xl">
<button onClick={() => void logout()} disabled={loggingOut} className="text-error font-body-md font-bold hover:underline active:opacity-70 transition-opacity disabled:opacity-60">
{loggingOut ? 'Logging out…' : 'Log out'}
</button>
</div>
</main>


    </>
  );
}
