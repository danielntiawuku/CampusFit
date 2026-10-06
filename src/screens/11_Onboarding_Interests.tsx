/* eslint-disable */
/**
 * Screen 11 — Onboarding Interests
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/11_Onboarding_Interests.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
export default function Stitch11_Onboarding_Interests() {
  return (
    <>


<header className="w-full px-container-padding pt-lg flex justify-between items-center bg-transparent">

<div className="flex gap-xs">
<div className="w-8 h-1.5 rounded-full bg-primary-container"></div>
<div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
<div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
</div>

<button className="font-label-md text-label-md text-on-surface-variant hover:opacity-70 transition-opacity">
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

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">fitness_center</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Stay fit</span>
</div>

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">groups</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Meet new people</span>
</div>

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined">emoji_events</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Compete on leaderboards</span>
</div>

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">hub</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Join a club</span>
</div>

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">map</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Explore campus</span>
</div>

<div className="selection-card cursor-pointer bg-surface-container-lowest border border-black/[0.05] rounded-xl p-md flex flex-col gap-sm shadow-sm">
<div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined">analytics</span>
</div>
<span className="font-title-md text-label-md text-on-surface leading-tight">Track my progress</span>
</div>
</section>
</main>

<footer className="w-full max-w-md px-container-padding pb-xl mt-auto">
<button className="w-full h-14 bg-outline-variant text-on-surface-variant font-label-md text-body-md rounded-full shadow-lg shadow-primary/5 transition-all duration-300 flex items-center justify-center" disabled={true} id="continue-btn">
            Continue
        </button>
</footer>


    </>
  );
}
