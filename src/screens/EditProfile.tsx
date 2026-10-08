import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Avatar, ScreenHeader, Icon } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { uploadAvatar } from '../lib/api';

const INTERESTS = [
  'Running',
  'Yoga',
  'Cycling',
  'Strength',
  'HIIT',
  'Mindfulness',
  'Football',
  'Swimming',
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, update } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [campus, setCampus] = useState(profile?.campus ?? '');
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleInterest(label: string) {
    setInterests(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      let avatarError: string | null = null;
      if (pendingFile && pendingFile.size > 0) {
        const id = profile?.id;
        if (id) {
          try {
            avatarUrl = (await uploadAvatar(pendingFile, id)) ?? avatarUrl;
          } catch (err) {
            avatarError = err instanceof Error ? err.message : 'Could not upload photo.';
          }
        }
      }
      await update({
        full_name: fullName.trim() || profile?.full_name || 'Student',
        bio: bio.trim() || null,
        campus: campus.trim() || null,
        interests,
        avatar_url: avatarUrl,
      });
      if (avatarError) setError(avatarError);
      else setSaved(true);
      window.setTimeout(() => navigate('/profile', { replace: true }), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setBusy(false);
    }
  }

  const initials =
    (fullName || 'Student')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('') || 'S';

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Edit profile" onBack={() => navigate(-1)} />

      <main className="space-y-lg px-container-padding pb-10">
        {error && <Alert>{error}</Alert>}
        {saved && !error && <Alert kind="success">Profile updated.</Alert>}

        <section className="flex flex-col items-center gap-sm">
          <div className="relative">
            <Avatar name={profile?.avatar_url ? '' : initials} size={96} />
            <button
              type="button"
              onClick={triggerFilePicker}
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-primary-container text-on-primary-container shadow-sm transition active:scale-90"
              aria-label="Change photo"
            >
              {profile?.avatar_url ? (
                <Icon name="edit" size={18} />
              ) : (
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.currentTarget.files?.[0];
                if (file && file.size <= 5 * 1024 * 1024) {
                  setPendingFile(file);
                  setSaved(false);
                  setError(null);
                } else {
                  setError('Please choose an image under 5MB.');
                }
              }}
            />
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {profile?.verification_status === 'verified' ? 'Verified student' : 'Verification pending'}
          </p>
        </section>

        <form className="space-y-md" onSubmit={onSubmit}>
          <div className="space-y-xs">
            <label htmlFor="ep-name" className="font-label-md text-label-md text-on-surface-variant">
              Full name
            </label>
            <input
              id="ep-name"
              className="field"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              required
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="ep-campus" className="font-label-md text-label-md text-on-surface-variant">
              Campus
            </label>
            <input
              id="ep-campus"
              className="field"
              value={campus}
              onChange={e => setCampus(e.target.value)}
              placeholder="University of Ghana"
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="ep-bio" className="font-label-md text-label-md text-on-surface-variant">
              Bio
            </label>
            <textarea
              id="ep-bio"
              rows={3}
              className="field h-auto resize-none py-3"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Second-year Computer Science. Chasing checkpoints before lectures."
              maxLength={180}
            />
            <p className="text-right font-label-sm text-label-sm text-on-surface-variant">
              {bio.length}/180
            </p>
          </div>

          <div className="space-y-xs">
            <p className="font-label-md text-label-md text-on-surface-variant">Interests</p>
            <div className="flex flex-wrap gap-xs">
              {INTERESTS.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleInterest(label)}
                  className="chip"
                  data-active={interests.includes(label)}
                >
                  {interests.includes(label) && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-sm pt-sm">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </div>
        </form>

        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-md">
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">Account</p>
          <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">
            {profile?.email} · Level {profile?.level ?? 1} · {(profile?.points ?? 0).toLocaleString()} pts
          </p>
        </div>
      </main>
    </div>
  );
}
