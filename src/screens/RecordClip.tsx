import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, ScreenHeader } from '../components/ui';

/**
 * Production screen not present in the Stitch export — the capture flow the
 * FitClips grid (screen 15) and feed (screens 02/13) imply. Uses the camera
 * when available and falls back to a graceful message on desktop.
 */
export default function RecordClip() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('North Loop Crew');
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        setCameraOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Camera unavailable — you can still write the post details below.');
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds(value => Math.min(value + 1, 60)), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  function toggleRecording() {
    if (seconds >= 60) return;
    setRecording(value => !value);
  }

  function postClip() {
    setPosted(true);
    streamRef.current?.getTracks().forEach(track => track.stop());
    window.setTimeout(() => navigate('/clips', { replace: true }), 900);
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col">
      <ScreenHeader title="New FitClip" onBack={() => navigate(-1)} />

      <main className="space-y-md px-container-padding pb-10">
        {error && <Alert>{error}</Alert>}

        <section className="relative overflow-hidden rounded-card border border-black/5 bg-brand-ink shadow-card">
          <div className="relative h-72 w-full">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full object-cover ${cameraOn ? '' : 'opacity-0'}`}
            />
            {!cameraOn && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
                <span className="material-symbols-outlined text-[52px]">videocam_off</span>
                <p className="font-label-md text-label-md">Camera preview unavailable</p>
              </div>
            )}

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
              <span
                className={`h-2 w-2 rounded-full ${recording ? 'animate-pulse bg-error' : 'bg-white/50'}`}
              />
              <span className="font-label-sm text-label-sm text-white">{recording ? 'REC' : 'READY'}</span>
            </div>
            <div className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 font-label-sm text-label-sm text-white backdrop-blur">
              {mmss} / 1:00
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              aria-label={recording ? 'Stop recording' : 'Start recording'}
            >
              <span
                className="grid h-16 w-16 place-items-center rounded-full border-4 border-white/80 transition-all duration-300"
                style={{
                  background: recording ? '#ba1a1a' : 'rgba(255,255,255,0.25)',
                  transform: recording ? 'scale(0.8)' : 'scale(1)',
                }}
              >
                <span
                  className="bg-white transition-all duration-300"
                  style={{
                    width: recording ? 18 : 26,
                    height: recording ? 18 : 26,
                    borderRadius: recording ? 4 : 999,
                  }}
                />
              </span>
            </button>
          </div>
        </section>

        <section className="card space-y-sm p-md">
          <label htmlFor="clip-caption" className="font-label-md text-label-md text-on-surface-variant">
            Caption
          </label>
          <textarea
            id="clip-caption"
            rows={3}
            maxLength={140}
            className="field h-auto resize-none py-3"
            placeholder="What did you get up to on campus today?"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-xs overflow-x-auto no-scrollbar">
              {['North Loop Crew', 'Zen Collective', 'Iron Society'].map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTag(label)}
                  className="chip"
                  data-active={tag === label}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {caption.length}/140
            </span>
          </div>
        </section>

        <button
          type="button"
          onClick={postClip}
          disabled={posted || seconds === 0}
          className="btn-primary w-full disabled:opacity-50"
        >
          {posted ? 'Posted ✓' : seconds === 0 ? 'Record a clip first' : 'Post FitClip'}
        </button>

        <p className="pb-2 text-center font-label-sm text-label-sm text-on-surface-variant">
          Clips are moderated by CampusFit · comments stay off by design
        </p>
      </main>
    </div>
  );
}
