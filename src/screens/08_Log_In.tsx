/* eslint-disable */
/**
 * Screen 08 — Log In
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/08_Log_In.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Stitch08_Log_In() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) setError(authError);
      else navigate('/home', { replace: true });
    } finally {
      setBusy(false);
    }
  }
  return (
    <>


<div className="fixed -top-16 -right-16 w-64 h-64 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
<div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-secondary-container/20 pointer-events-none transition-transform duration-1000 animate-pulse"></div>
<main className="w-full max-w-md px-container-padding pt-xl pb-lg flex-grow flex flex-col">

<header className="mt-12 mb-xl">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background tracking-tight">
                Welcome back
            </h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                Let's get you moving.
            </p>
</header>

<form className="space-y-md" onSubmit={onSubmit}>

{error && <Alert>{error}</Alert>}

<div className="space-y-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="email">SCHOOL EMAIL</label>
<div className="relative group">
<input className="w-full bg-surface-container-lowest border border-black/5 rounded-2xl px-md py-md font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all placeholder:text-outline-variant" id="email" placeholder="student@university.edu" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
<span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline-variant">alternate_email</span>
</div>
</div>

<div className="space-y-xs">
<label className="font-label-sm text-label-sm text-on-surface-variant ml-xs" htmlFor="password">PASSWORD</label>
<div className="relative group">
<input className="w-full bg-surface-container-lowest border border-black/5 rounded-2xl px-md py-md font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all placeholder:text-outline-variant" id="password" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required/>
<button onClick={() => setShowPassword(v => !v)} className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors active:scale-90 flex items-center justify-center" type="button">
<span className="material-symbols-outlined" id="password-toggle-icon">{showPassword ? 'visibility_off' : 'visibility'}</span>
</button>
</div>
<div className="flex justify-end">
<a className="font-label-sm text-label-sm text-primary-container font-semibold hover:opacity-80 transition-opacity" href="#">Forgot password?</a>
</div>        </div>

<div className="mt-xl">
<button disabled={busy} type="submit" className="w-full bg-primary-container text-on-primary-container font-title-md text-title-md py-md rounded-full shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-60">
                {busy ? 'Signing in…' : 'Log In'}
            </button>
</div>
</form>

<div className="flex items-center my-xl px-sm">
<div className="flex-grow h-[1px] bg-outline-variant/30"></div>
<span className="mx-md font-label-sm text-label-sm text-outline uppercase tracking-widest">or continue with</span>
<div className="flex-grow h-[1px] bg-outline-variant/30"></div>
</div>

<div className="flex justify-center gap-lg">
<button className="w-14 h-14 rounded-full bg-surface-container-lowest border border-black/5 flex items-center justify-center shadow-sm active:scale-90 transition-transform hover:bg-white">
<div className="w-6 h-6 bg-contain bg-no-repeat bg-center" data-alt="Official Google logo on a clean white background, high-resolution vector style, minimalist corporate identity branding for a modern fitness and wellness mobile application." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAuIsi6WQ3ycVUwGMVDql3LcTjNyB0H0jG2eppqQzFUKWGHWoSrPc2w1NesZlvnoAddOijDk7bcFKz2MDnscjxJ6czlisuiNgqs0I1D33sY5wHHfZQPL1jDPOD43HAFcGP67dwf4U7eoSqDPQr04ORAqHuEfY7vTRT0a7BoFzft_xD0YIuRVRLq2X4clPCdNpk-Uq66DedWTFFKsek_GPvqtWOmVwiTsDlSuE1XgsuK7tECvF0mCSUJQwyvv47Q-6Q3xE3MX7AVwPzV')" }}></div>
</button>
<button className="w-14 h-14 rounded-full bg-surface-container-lowest border border-black/5 flex items-center justify-center shadow-sm active:scale-90 transition-transform hover:bg-white">
<div className="w-6 h-6 bg-contain bg-no-repeat bg-center" data-alt="Official Apple logo icon in minimalist black, rendered on a clean white background, high-resolution vector style, symbolizing modern technology integration and secure mobile authentication." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAK29p5T8bH0VSM15-pkLSH1-GbvrQhtZDdygZUBNfYueTuarfs8DubfjtKRXUfiH_fsUmHDwMz5xaud0eksYtz5StcDjyFWVd2XgrJujwqwUcxkjXb-NbCcg24U72uzaA_idv-jDzPGWl6BaOriE5l9r5zOU5XwlAEFhJFGedaLvaol1Ef8j8aSPp6YPO7aCCK3s1NLnoZvG8j4EKTCdJy2xr_hcJ3gvp67W4bVjJsEbcrz5s4CPUhWF-pq0r9WXK0asQR0vqpGy9')" }}></div>
</button>
</div>
</main>

<footer className="w-full py-xl px-container-padding text-center">
<p className="font-body-md text-body-md text-on-surface-variant">
            New to CampusFit? <Link className="text-primary-container font-bold hover:underline underline-offset-4" to="/signup">Sign up</Link>
</p>
</footer>

<div className="fixed inset-0 bg-background/90 z-50 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-500" id="success-overlay">
<div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-md animate-bounce">
<span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<p className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Getting ready...</p>
</div>


    </>
  );
}
