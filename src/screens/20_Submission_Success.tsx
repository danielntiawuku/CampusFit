/* eslint-disable */
/**
 * Screen 20 — Submission Success
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/20_Submission_Success.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useLocation, useNavigate } from 'react-router-dom';

export default function Stitch20_Submission_Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const ticket =
    (location.state as { ticket?: string } | null)?.ticket ??
    `CF-${String(Math.floor(1000 + Math.random() * 9000))}`;
  return (
    <>


<header className="w-full top-0 sticky bg-surface flex items-center px-container-padding h-16 w-full max-w-screen-xl mx-auto">
<div className="flex items-center gap-md">
<button onClick={() => navigate('/help')} className="material-symbols-outlined text-primary active:scale-95 transition-transform" data-icon="arrow_back">arrow_back</button>
<span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">CampusFit</span>
</div>
</header>

<main className="flex-1 flex flex-col items-center justify-center px-container-padding text-center max-w-md w-full py-xl scale-in">

<div className="relative w-48 h-48 mb-xl flex items-center justify-center">

<div className="absolute inset-0 bg-primary-container/10 rounded-full animate-pulse"></div>
<div className="absolute inset-4 bg-primary-container/20 rounded-full"></div>

<div className="success-float bg-primary-container text-on-primary-container w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-primary-container/20">
<span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
</div>

<div className="space-y-md">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background">Report Received</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant px-sm">
                Thanks for helping us improve CampusFit! Our team will look into this and get back to you within 24 hours.
            </p>
</div>

<div className="mt-xl w-full space-y-sm">
<button onClick={() => navigate('/home')} className="w-full h-14 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
                Back to Home
            </button>
<button onClick={() => navigate('/help')} className="w-full h-14 bg-transparent border-2 border-primary text-primary font-label-md text-label-md rounded-full font-bold hover:bg-primary/5 active:scale-95 transition-all">
                View Help Center
            </button>
</div>

<div className="mt-xl opacity-40">
<div className="h-1 bg-outline-variant w-16 mx-auto rounded-full mb-xs"></div>
<p className="font-label-sm text-label-sm uppercase tracking-widest text-outline">Ticket #{ticket}</p>
</div>
</main>

<footer className="h-24 w-full flex items-center justify-center px-container-padding">

<div className="w-full max-w-xs h-16 rounded-full overflow-hidden relative opacity-10">
<div className="absolute inset-0 bg-gradient-to-r from-primary via-tertiary-container to-secondary"></div>
</div>
</footer>


    </>
  );
}
