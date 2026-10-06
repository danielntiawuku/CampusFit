/* eslint-disable */
/**
 * Screen 07 — Create Account
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/07_Create_Account.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Stitch07_Create_Account() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (!terms) {
      setError('Please accept the Terms & Privacy Policy to continue.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await signUp({ fullName, email, password, campus });
      if (authError) {
        setError(authError);
      } else {
        navigate('/verify', { replace: true });
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <>


<div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-fixed/20 to-transparent pointer-events-none"></div>
<main className="w-full max-w-md px-container-padding pt-xl pb-lg relative z-10 flex-grow">

<header className="mb-xl text-center md:text-left">
<div className="flex items-center justify-center md:justify-start mb-md">
<div className="w-12 h-12 bg-primary-container flex items-center justify-center rounded-2xl rotate-3 shadow-sm">
<span className="material-symbols-outlined text-on-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
</div>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight mb-xs">
                Create your account
            </h1>
<p className="font-body-md text-on-surface-variant">
                Join your campus fitness community.
            </p>
</header>

<form className="space-y-md" onSubmit={onSubmit}>

{error && <Alert>{error}</Alert>}

<div className="group">
<label className="block font-label-md text-on-surface-variant mb-base px-xs" htmlFor="name">Full name</label>
<div className="relative">
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-[14px] px-md py-sm font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none input-shadow" id="name" placeholder="Alex Rivera" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required/>
</div>
</div>

<div className="group">
<label className="block font-label-md text-on-surface-variant mb-base px-xs" htmlFor="email">School email</label>
<div className="relative">
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-[14px] px-md py-sm font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none input-shadow" id="email" placeholder="alex@university.edu" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
</div>
</div>

<div className="group">
<label className="block font-label-md text-on-surface-variant mb-base px-xs" htmlFor="university">Campus/University</label>
<div className="relative">
<select className="w-full bg-surface-container-lowest border border-outline-variant rounded-[14px] px-md py-sm font-body-md text-on-surface appearance-none focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none input-shadow" id="university" value={campus} onChange={e => setCampus(e.target.value)}>
<option disabled={true} value="">Select your campus</option>
<option value="stanford">Stanford University</option>
<option value="mit">MIT</option>
<option value="berkeley">UC Berkeley</option>
<option value="ucla">UCLA</option>
<option value="other">Other Campus</option>
</select>
<div className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none">
<span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
</div>
</div>

<div className="group">
<label className="block font-label-md text-on-surface-variant mb-base px-xs" htmlFor="password">Password</label>
<div className="relative">
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-[14px] px-md py-sm font-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none input-shadow pr-12" id="password" placeholder="Min. 8 characters" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required/>
<button onClick={() => setShowPassword(v => !v)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined" id="password-icon">{showPassword ? 'visibility_off' : 'visibility'}</span>
</button>
</div>
</div>

<div className="flex items-start space-x-sm pt-xs">
<div className="pt-1">
<input checked={terms} onChange={e => setTerms(e.target.checked)} className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary-container cursor-pointer" id="terms" type="checkbox"/>
</div>
<label className="font-body-md text-on-surface-variant leading-tight" htmlFor="terms">
                    I agree to the <a className="text-primary font-medium underline underline-offset-2" href="#">Terms</a> &amp; <a className="text-primary font-medium underline underline-offset-2" href="#">Privacy Policy</a>.
                </label>
</div>

<div className="pt-md">
<button disabled={busy} className="w-full bg-primary-container text-on-primary-container font-title-md py-md rounded-full shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform flex items-center justify-center group disabled:opacity-60" type="submit">
                    {busy ? 'Creating account…' : 'Create Account'}
                    <span className="material-symbols-outlined ml-xs transition-transform group-hover:translate-x-1">arrow_forward</span>
</button>
</div>
</form>

<div className="mt-xl flex items-center">
<div className="flex-grow h-px bg-outline-variant"></div>
<span className="px-md font-label-sm text-on-surface-variant uppercase tracking-widest">or continue with</span>
<div className="flex-grow h-px bg-outline-variant"></div>
</div>

<div className="mt-lg flex justify-center space-x-lg">
<button className="w-14 h-14 bg-surface-container-lowest border border-outline-variant rounded-full flex items-center justify-center hover:bg-surface transition-colors active:scale-95 shadow-sm">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.5-5.3 3.5-8.8z" fill="#4285F4"></path>
<path d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.4 7.4 24 12 24z" fill="#34A853"></path>
<path d="M5.3 14.3c-.2-.6-.4-1.3-.4-2.3s.2-1.7.4-2.3V6.6H1.3c-.8 1.6-1.3 3.4-1.3 5.4s.5 3.8 1.3 5.4l4-3.1z" fill="#FBBC05"></path>
<path d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" fill="#EA4335"></path>
</svg>
</button>
<button className="w-14 h-14 bg-surface-container-lowest border border-outline-variant rounded-full flex items-center justify-center hover:bg-surface transition-colors active:scale-95 shadow-sm">
<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M17.05 20.28c-.96.002-1.92-.31-2.73-.89-.83-.61-1.74-.91-2.71-.91-1 0-1.89.31-2.72.93-.8.61-1.74.92-2.72.92-2.44 0-5.35-4.14-5.35-8.62 0-3.9 2.5-6.05 4.93-6.05 1.05 0 2 .28 2.76.78.69.45 1.48.69 2.31.69.83 0 1.65-.24 2.36-.71.84-.54 1.77-.8 2.87-.8 2.34 0 4.24 1.81 4.7 4.1-.11.05-2.12.91-2.12 3.37 0 2.86 2.45 3.87 2.53 3.9-.13.37-.53 1.41-1.29 2.52-.92 1.35-1.9 2.71-3.47 2.71zM11.95 5.53c.03-1.89 1.58-3.45 3.45-3.48.06 1.88-1.57 3.51-3.45 3.48z" fill="black"></path>
</svg>
</button>
</div>
</main>

<footer className="w-full max-w-md px-container-padding py-lg text-center relative z-10">
<p className="font-body-md text-on-surface-variant">
            Already have an account?
            <Link className="text-primary font-bold hover:underline underline-offset-4 ml-xs transition-all" to="/login">Log in</Link>
</p>

<div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-8 w-64 h-16 bg-primary/5 blur-3xl rounded-full"></div>
</footer>


    </>
  );
}
