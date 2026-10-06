/* eslint-disable */
/**
 * Screen 19 — Report a Problem
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/19_Report_a_Problem.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { submitProblemReport } from '../lib/api';

export default function Stitch19_Report_a_Problem() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (!category || details.trim().length < 10) {
      setError('Pick an issue type and describe the problem in at least a sentence.');
      return;
    }
    setBusy(true);
    try {
      await submitProblemReport(profile?.id ?? 'demo-user', {
        category,
        subject: category.replace(/-/g, ' '),
        details: details.trim(),
      });
      navigate('/report/done', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the report.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>


<header className="w-full top-0 sticky z-50 bg-[#FAF5EE] h-16 flex items-center px-container-padding transition-colors">
<div className="flex items-center w-full max-w-screen-xl mx-auto">
<button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200">
<span className="material-symbols-outlined text-on-surface" data-icon="arrow_back">arrow_back</span>
</button>
<h1 className="ml-2 font-title-md text-title-md text-on-surface">Report a Problem</h1>
</div>
</header>

<main className="flex-1 px-container-padding py-md max-w-md mx-auto w-full space-y-md mb-24">

<div className="mb-lg">
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-tight">Something not working?</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">Let us know what's happening so we can fix it for you.</p>
</div>
<form className="space-y-md" onSubmit={onSubmit}>

{error && <Alert>{error}</Alert>}

<section className="bg-surface-container-lowest rounded-xl border border-black/5 p-md kinetic-shadow">
<label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="issue-type">What's wrong?</label>
<div className="relative">
<select className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md appearance-none transition-all" id="issue-type" value={category} onChange={e => setCategory(e.target.value)}>
<option disabled={true} value="">Select an issue</option>
<option value="app-crash">App crash</option>
<option value="login-issue">Login issue</option>
<option value="qr-scan-error">QR scan error</option>
<option value="profile-issue">Profile issue</option>
<option value="other">Other</option>
</select>
<div className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="expand_more">expand_more</span>
</div>
</div>
</section>

<section className="bg-surface-container-lowest rounded-xl border border-black/5 p-md kinetic-shadow">
<label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="description">Tell us more</label>
<textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-md font-body-md placeholder:text-outline transition-all resize-none" id="description" placeholder="Describe the issue in detail..." rows={5} value={details} onChange={e => setDetails(e.target.value)}></textarea>
</section>

<section className="bg-surface-container-lowest rounded-xl border border-black/5 p-md kinetic-shadow">
<label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Add a screenshot (optional)</label>
<input
ref={fileRef}
type="file"
accept="image/*"
className="hidden"
onChange={e => setAttachment(e.target.files?.[0]?.name ?? null)}
/>
<div
onClick={() => fileRef.current?.click()}
className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center space-y-xs cursor-pointer hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200"
>
<span className="material-symbols-outlined text-primary text-3xl" data-icon="add_a_photo">{attachment ? 'check_circle' : 'add_a_photo'}</span>
<span className="font-label-md text-label-md text-on-surface-variant">{attachment ?? 'Upload image'}</span>
</div>
</section>

<div className="pt-md pb-lg">
<button disabled={busy} className="w-full h-14 bg-primary-container text-on-primary-container rounded-full font-title-md text-title-md shadow-md active:scale-95 transition-all flex items-center justify-center space-x-sm disabled:opacity-60" type="submit">
<span>{busy ? 'Submitting…' : 'Submit Report'}</span>
<span className="material-symbols-outlined" data-icon="send">send</span>
</button>
<p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-md">
                    We typically respond within 24 hours.
                </p>
</div>
</form>

<div className="flex justify-center pt-lg opacity-40 grayscale pointer-events-none">
<div className="w-32 h-32 rounded-3xl bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-6xl text-on-surface-variant" data-icon="support_agent">support_agent</span>
</div>
</div>
</main>


    </>
  );
}
