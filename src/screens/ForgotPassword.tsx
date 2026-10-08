import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Icon } from '../components/ui';
import { isSupabaseConfigured, supabaseOrNull } from '../lib/supabase';

/**
 * Production screen not present in the Stitch export — mirrors screen 08
 * (Log In) so the auth flow reads as one system.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const sb = supabaseOrNull();
      if (!sb) {
        // Demo mode: no mail is sent, but the flow stays explorable.
        setSent(true);
        return;
      }
      const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) setError(resetError.message);
      else setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed -top-16 -right-16 w-64 h-64 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

      <main className="w-full max-w-md px-container-padding pt-xl pb-lg flex-grow flex flex-col">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="mb-lg grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition active:scale-95"
        >
          <Icon name="arrow_back" size={22} />
        </button>

        <header className="mb-xl">
          <div className="mb-md grid h-12 w-12 rotate-3 place-items-center rounded-2xl bg-primary-container shadow-sm">
            <Icon name="lock_reset" size={26} className="text-on-primary-container" fill />
          </div>
          <h1 className="mb-xs font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-background">
            Reset your password
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We'll email you a secure link to set a new password.
          </p>
        </header>

        {sent ? (
          <div className="animate-fade-up space-y-md rounded-card border border-primary-container/40 bg-primary-container/10 p-lg">
            <div className="flex items-center gap-xs">
              <Icon name="check_circle" size={24} className="text-primary" />
              <p className="font-title-md text-title-md text-on-primary-container">Check your inbox</p>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              If an account exists for <span className="font-semibold text-on-surface">{email}</span>, a reset
              link is on its way. It expires in 60 minutes.
            </p>
            <div className="flex gap-sm">
              <Link to="/login" className="btn-primary flex-1">
                Back to log in
              </Link>
              <button type="button" onClick={() => navigate('/signup')} className="btn-ghost flex-1">
                Create account
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-md" onSubmit={onSubmit}>
            {error && <Alert>{error}</Alert>}
            {!isSupabaseConfigured && (
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Demo mode — Supabase isn't configured, so no email will actually be sent.
              </p>
            )}

            <div className="space-y-xs">
              <label className="ml-xs block font-label-sm text-label-sm text-on-surface-variant" htmlFor="reset-email">
                SCHOOL EMAIL
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  className="w-full rounded-2xl border border-black/5 bg-surface-container-lowest px-md py-md font-body-md text-body-md outline-none transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container/50"
                  placeholder="student@university.edu"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant">
                  <Icon name="alternate_email" size={22} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-xl w-full rounded-full bg-primary-container py-md font-title-md text-title-md text-on-primary-container shadow-lg shadow-primary-container/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        )}

        <footer className="mt-xl text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-primary-container underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
