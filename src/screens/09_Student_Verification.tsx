/* eslint-disable */
/**
 * Screen 09 — Student Verification
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/09_Student_Verification.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Stitch09_Student_Verification() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'id'>('email');
  const [email, setEmail] = useState('');
  return (
    <>


<header className="w-full px-container-padding pt-xl pb-md flex items-center">
<button onClick={() => navigate(-1)} className="p-xs -ml-xs hover:bg-surface-variant/20 rounded-full transition-colors active:scale-95 duration-200">
<span className="material-symbols-outlined text-on-surface">arrow_back</span>
</button>
</header>
<main className="w-full max-w-md px-container-padding flex flex-col flex-1">

<div className="flex gap-xs mb-lg justify-start items-center">
<div className="w-2 h-2 rounded-full bg-primary-container"></div>
<div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
<div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
</div>

<div className="mb-xl">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs font-bold leading-tight">
                Verify your student status
            </h1>
<p className="font-body-md text-on-surface-variant opacity-80">
                This keeps CampusFit a trusted campus-only community.
            </p>
</div>

<section className="flex flex-col gap-card-gap mb-xl">

<div onClick={() => setMethod('email')} className={`p-md rounded-xl card-border flex gap-md items-start cursor-pointer transition-all active:scale-[0.98] ${method === 'email' ? 'bg-surface-container-lowest active-selection' : 'bg-surface-container-lowest opacity-70 hover:opacity-100'}`}>
<div className="flex-shrink-0 mt-1">
<div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
</div>
</div>
<div className="flex-grow">
<h3 className="font-title-md text-on-surface mb-1 leading-none">Verify with school email</h3>
<p className="font-label-md text-on-surface-variant opacity-70">We'll send a code to your .edu/campus email</p>
</div>    <div className="flex-shrink-0 mt-1">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'email' ? 'border-primary' : 'border-outline-variant'}`}>
        {method === 'email' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
      </div>
    </div>
</div>

<div onClick={() => setMethod('id')} className={`p-md rounded-xl card-border flex gap-md items-start cursor-pointer transition-all active:scale-[0.98] ${method === 'id' ? 'bg-surface-container-lowest active-selection' : 'bg-surface-container-lowest opacity-70 hover:opacity-100'}`}>
<div className="flex-shrink-0 mt-1">
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="badge">badge</span>
</div>
</div>
<div className="flex-grow">
<h3 className="font-title-md text-on-surface mb-1 leading-none">Upload student ID</h3>
<p className="font-label-md text-on-surface-variant opacity-70">Take a photo of your student ID card</p>
</div>    <div className="flex-shrink-0 mt-1">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'id' ? 'border-primary' : 'border-outline-variant'}`}>
        {method === 'id' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
      </div>
    </div>
</div>
</section>

<section className="flex flex-col gap-sm mb-auto">
<div className="bg-surface-container-lowest p-lg rounded-xl card-border">
<label className="block font-label-sm text-on-surface-variant uppercase mb-xs tracking-wider" htmlFor="school-email">
                    School email
                </label>
<div className="relative">
<input className="w-full bg-surface-container-low border-none rounded-xl px-md py-sm font-body-md text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container transition-shadow outline-none" id="school-email" placeholder="student@university.edu" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
</div>
<p className="mt-sm font-label-md text-on-surface-variant/60 flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">info</span>
                    Verification usually takes under 2 minutes.
                </p>
</div>
</section>

<footer className="w-full pt-lg pb-xl flex flex-col items-center gap-md">
<button onClick={() => navigate('/otp')} className="w-full py-md bg-primary-container text-on-primary-container font-title-md rounded-full shadow-lg shadow-primary-container/20 hover:brightness-95 active:scale-95 transition-all">
                Send verification code
            </button>
<div className="flex items-center gap-xs text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
<span className="font-label-sm">Your data is encrypted and never shared.</span>
</div>
</footer>
</main>

<div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary-container/5 blur-[100px] pointer-events-none z-0"></div>
<div className="fixed bottom-[10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-secondary-container/5 blur-[120px] pointer-events-none z-0"></div>


    </>
  );
}
