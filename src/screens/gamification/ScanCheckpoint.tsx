import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { Alert, DifficultyPill, Icon, ScreenHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchCheckpoints, scanCheckpoint, type ScanResult, usingDemoData } from '../../lib/api';
import { DIFFICULTY_MULTIPLIER } from '../../lib/demo';
import type { Checkpoint } from '../../lib/types';

/**
 * Objective 4 — QR/NFC checkpoint validation.
 * Camera viewfinder (when the browser grants camera access) plus a manual
 * code entry fallback so the loop works on desktop and in demo mode.
 */
export default function ScanCheckpoint() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const decodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);
  const decodingRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  useEffect(() => {
    fetchCheckpoints().then(setCheckpoints).catch(() => setCheckpoints([]));
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  async function toggleCamera() {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraOn(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCameraError('Camera unavailable — enter the checkpoint code below instead.');
    }
  }

  /** Pull a checkpoint code out of whatever the QR image contained. */
  function codeFromQr(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    // Prefer a known checkpoint code embedded in the payload (labels, URLs).
    const match = checkpoints.find(cp => trimmed.toUpperCase().includes(cp.code.toUpperCase()));
    if (match) return match.code;
    if (/^[A-Za-z0-9-]{2,24}$/.test(trimmed)) return trimmed;
    return null;
  }

  /** Read QR frames off the live camera and auto-submit the decoded code. */
  useEffect(() => {
    if (!cameraOn) return;
    let raf = 0;
    if (!decodeCanvasRef.current) decodeCanvasRef.current = document.createElement('canvas');
    const canvas = decodeCanvasRef.current;

    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && !decodingRef.current) {
        const width = Math.min(480, video.videoWidth);
        const height = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * width));
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          decodingRef.current = true;
          try {
            ctx.drawImage(video, 0, 0, width, height);
            const image = ctx.getImageData(0, 0, width, height);
            const hit = jsQR(image.data, width, height, { inversionAttempts: 'attemptBoth' });
            if (hit && hit.data) {
              const code = codeFromQr(hit.data);
              const now = Date.now();
              const last = lastScanRef.current;
              // Re-submit the same code only after 8s, matching the cooldown UX.
              if (code && (!last || last.code !== code || now - last.at > 8000)) {
                lastScanRef.current = { code, at: now };
                void submit(code);
              }
            }
          } finally {
            decodingRef.current = false;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, checkpoints]);

  async function submit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await scanCheckpoint(trimmed);
      setResult(res);
      if (res.ok) {
        setCode('');
        await refreshProfile();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Scan checkpoint"
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/leaderboard')}
            aria-label="Leaderboard"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80"
          >
            <Icon name="leaderboard" size={22} />
          </button>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {/* Viewfinder ---------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-card border border-black/5 bg-brand-ink shadow-card">
          <div className="relative h-64 w-full">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full object-cover ${cameraOn ? '' : 'hidden'}`}
            />
            {!cameraOn && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
                <Icon name="qr_code_scanner" size={56} />
                <p className="font-label-md text-label-md">
                  Point your camera at a CampusFit checkpoint
                </p>
                <p className="font-label-sm text-label-sm text-white/50">
                  The QR code is read automatically, or type the code below
                </p>
              </div>
            )}

            {/* Scan frame */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="relative h-44 w-44">
                {[
                  'left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl',
                  'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl',
                  'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl',
                  'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl',
                ].map(pos => (
                  <span
                    key={pos}
                    className={`absolute h-10 w-10 border-primary-container ${pos}`}
                  />
                ))}
                <span className="scan-line absolute left-2 right-2 top-1/2 h-0.5 bg-primary-container shadow-[0_0_12px_rgba(30,204,139,0.9)]" />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCamera}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 font-label-sm text-label-sm text-white backdrop-blur transition hover:bg-black/70"
            >
              <Icon name={cameraOn ? 'videocam_off' : 'photo_camera'} size={16} />
              {cameraOn ? 'Stop camera' : 'Start camera'}
            </button>
          </div>
        </section>

        {cameraError && <Alert>{cameraError}</Alert>}
        {usingDemoData && (
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Demo mode — Supabase not configured, scans are simulated locally.
          </p>
        )}

        {/* Manual entry -------------------------------------------------- */}
        <section className="card p-lg">
          <label
            htmlFor="cp-code"
            className="mb-xs block font-label-md text-label-md text-on-surface-variant"
          >
            Enter checkpoint code
          </label>
          <div className="flex gap-sm">
            <input
              id="cp-code"
              className="field flex-1 uppercase"
              placeholder="e.g. LIB-A1"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void submit(code);
              }}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn-primary px-5"
              disabled={busy || !code.trim()}
              onClick={() => void submit(code)}
            >
              {busy ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                'Claim'
              )}
            </button>
          </div>

          {result &&
            (result.ok ? (
              <div className="mt-md animate-pop rounded-2xl border border-primary-container/40 bg-primary-container/10 p-md">
                <div className="flex items-center gap-xs">
                  <Icon name="check_circle" size={22} className="text-primary" />
                  <p className="font-title-md text-title-md text-on-primary-container">
                    +{result.points_awarded} pts
                  </p>
                  {result.difficulty && <DifficultyPill level={result.difficulty} />}
                </div>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  {result.checkpoint}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant">
                  {result.location} · total {result.total_points?.toLocaleString()} pts
                </p>
              </div>
            ) : (
              <div className="mt-md">
                <Alert>
                  {result.error === 'checkpoint_not_found'
                    ? 'No checkpoint with that code. Check the sign and try again.'
                    : result.error === 'cooldown'
                      ? `Already scanned recently — try again in ${Math.ceil((result.retry_after_seconds ?? 0) / 60)} min.`
                      : result.error ?? 'Scan failed.'}
                </Alert>
              </div>
            ))}
        </section>

        {/* Nearby checkpoints ------------------------------------------- */}
        <section className="space-y-sm">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-title-md text-title-md">Checkpoint board</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tap a code to fill it in
              </p>
            </div>
            <button
              type="button"
              className="font-label-md text-label-md text-tertiary"
              onClick={() => navigate('/explore')}
            >
              Map view
            </button>
          </div>

          <div className="space-y-sm">
            {checkpoints.map(cp => (
              <button
                key={cp.id}
                type="button"
                onClick={() => setCode(cp.code)}
                className="card flex w-full items-center gap-sm p-md text-left transition hover:shadow-card-lg"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-container/15 text-primary">
                  <Icon name="location_on" size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-label-md text-label-md font-semibold">{cp.name}</p>
                  <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
                    {cp.location} · <span className="font-mono">{cp.code}</span>
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Details for ${cp.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/checkpoint/${cp.code}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      navigate(`/checkpoint/${cp.code}`);
                    }
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container transition"
                >
                  <Icon name="info" size={18} />
                </span>
                <DifficultyPill level={cp.difficulty} />
                <span className="font-label-md text-label-md font-semibold text-primary">
                  {Math.round(cp.base_points * DIFFICULTY_MULTIPLIER[cp.difficulty])}p
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
