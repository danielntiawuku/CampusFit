/* eslint-disable */
/**
 * Screen 10 — OTP Verification
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/10_OTP_Verification.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Stitch10_OTP_Verification() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);

  function setDigit(index: number, value: string) {
    setDigits(prev => prev.map((d, i) => (i === index ? value.slice(-1) : d)));
  }

  return (
    <>


<header className="w-full flex justify-between items-center px-container-padding pt-xl pb-md">
<button onClick={() => navigate(-1)} aria-label="Back" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-black/[0.05] active:scale-95 transition-transform">
<span className="material-symbols-outlined text-on-background">arrow_back</span>
</button>
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-primary-container"></div>
<span className="font-label-md text-label-md font-bold tracking-tight text-primary">CampusFit</span>
</div>
<div className="w-10"></div>
</header>
<main className="flex-1 px-container-padding flex flex-col pt-lg max-w-md mx-auto w-full">

<div className="mb-xl">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-sm">Enter your code</h1>
<p className="font-body-md text-body-md text-on-surface-variant opacity-80 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-on-background">ama@university.edu.gh</span>
</p>
</div>

<div className="flex justify-between gap-2 mb-lg" id="otp-container">
{digits.map((d, i) => (
<input key={i} autoFocus={i === 0} value={d} onChange={e => setDigit(i, e.target.value)} inputMode="numeric" aria-label={`Digit ${i + 1}`} className={`otp-input w-[48px] h-[56px] text-center text-title-md font-title-md bg-white border rounded-[14px] transition-all ${i === 2 ? 'border-primary-container ring-2 ring-primary-container/10' : 'border-outline-variant'}`} maxLength={1} type="text"/>
))}
</div>

<div className="flex flex-col items-center gap-base mb-xl">
<div className="flex items-center gap-xs text-on-surface-variant/70">
<span className="material-symbols-outlined text-[18px]">schedule</span>
<p className="font-label-md text-label-md">Resend code in <span className="font-semibold text-on-background" id="timer">0:48</span></p>
</div>
<button className="font-label-md text-label-md text-primary opacity-40 cursor-not-allowed mt-xs" disabled={true}>
                Didn't receive a code?
            </button>
</div>

<div className="mt-auto pb-xl flex flex-col gap-md">
<button type="button" onClick={() => navigate('/onboarding', { replace: true })} className="w-full h-14 bg-primary-container text-on-primary-container font-title-md text-title-md rounded-full flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/10">
                Verify
            </button>
<p className="text-center font-label-sm text-label-sm text-on-surface-variant/60 px-lg">
                By verifying, you agree to our University Health &amp; Privacy Policy for CampusFit.
            </p>
</div>

<div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute -top-12 -right-12 w-48 h-48 bg-tertiary-container/5 rounded-full blur-3xl pointer-events-none"></div>
</main>

<div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-lg py-md rounded-full flex items-center gap-md shadow-xl opacity-0 translate-y-10 transition-all duration-500 pointer-events-none z-50" id="success-toast">
<span className="material-symbols-outlined text-primary-fixed">check_circle</span>
<span className="font-label-md text-label-md">Verification Successful</span>
</div>


    </>
  );
}
