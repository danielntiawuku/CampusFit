import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../components/ui';

/**
 * Production screen not present in the Stitch export — answers the three
 * privacy rows on screen 17 with real, persisted controls.
 */
type Audience = 'everyone' | 'club' | 'only_me';

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: 'everyone', label: 'Everyone', hint: 'Any CampusFit student on your campus' },
  { value: 'club', label: 'My club', hint: 'Only members of your primary club' },
  { value: 'only_me', label: 'Only me', hint: 'Kept private to your account' },
];

const BLOCKED = [
  { id: 'b1', name: 'Spam Account', reason: 'Repeated fake check-ins' },
  { id: 'b2', name: 'Anonymous Bot', reason: 'Abusive FitClip captions' },
];

export default function Privacy() {
  const navigate = useNavigate();

  const [tripAudience, setTripAudience] = useState<Audience>(
    () => (localStorage.getItem('campusfit-trip-audience') as Audience | null) ?? 'club'
  );
  const [profileAudience, setProfileAudience] = useState<Audience>(
    () => (localStorage.getItem('campusfit-profile-audience') as Audience | null) ?? 'everyone'
  );
  const [discoverable, setDiscoverable] = useState(
    () => localStorage.getItem('campusfit-discoverable') !== 'false'
  );
  const [activityStatus, setActivityStatus] = useState(
    () => localStorage.getItem('campusfit-activity-status') !== 'false'
  );
  const [blocked, setBlocked] = useState(BLOCKED);

  function persist(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  function AudienceControl({
    value,
    onChange,
    storageKey,
  }: {
    value: Audience;
    onChange: (next: Audience) => void;
    storageKey: string;
  }) {
    return (
      <div className="flex gap-xs rounded-full bg-surface-container p-[3px]">
        {AUDIENCE_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              persist(storageKey, option.value);
            }}
            className={`rounded-full px-3 py-1.5 font-label-sm text-label-sm transition-all ${
              value === option.value
                ? 'bg-surface-container-lowest font-bold text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  function ToggleRow({
    label,
    hint,
    checked,
    onToggle,
    storageKey,
  }: {
    label: string;
    hint: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
    storageKey: string;
  }) {
    return (
      <div className="flex items-center justify-between border-b border-surface-variant/30 p-md">
        <div className="pr-sm">
          <p className="font-body-md text-on-surface">{label}</p>
          <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">{hint}</p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer">
          <input
            className="sr-only ios-toggle"
            type="checkbox"
            checked={checked}
            onChange={e => {
              onToggle(e.target.checked);
              persist(storageKey, String(e.target.checked));
            }}
          />
          <div className="ios-toggle-bg h-6 w-11 rounded-full bg-surface-variant transition-colors duration-200" />
          <div className="ios-toggle-dot absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200" />
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Privacy" onBack={() => navigate(-1)} />

      <main className="space-y-lg px-container-padding pb-10">
        <section className="space-y-sm">
          <h2 className="px-base text-label-sm uppercase tracking-widest text-on-surface-variant">
            Who can see my FitTrips
          </h2>
          <div className="rounded-xl border border-black/5 bg-surface-container-lowest p-md shadow-sm">
            <p className="mb-sm font-label-sm text-label-sm font-normal text-on-surface-variant">
              {AUDIENCE_OPTIONS.find(option => option.value === tripAudience)?.hint}
            </p>
            <AudienceControl value={tripAudience} onChange={setTripAudience} storageKey="campusfit-trip-audience" />
          </div>
        </section>

        <section className="space-y-sm">
          <h2 className="px-base text-label-sm uppercase tracking-widest text-on-surface-variant">
            Profile visibility
          </h2>
          <div className="overflow-hidden rounded-xl border border-black/5 bg-surface-container-lowest shadow-sm">
            <div className="border-b border-surface-variant/30 p-md">
              <p className="mb-sm font-body-md text-on-surface">Who can open my profile</p>
              <AudienceControl
                value={profileAudience}
                onChange={setProfileAudience}
                storageKey="campusfit-profile-audience"
              />
            </div>
            <ToggleRow
              label="Discoverable"
              hint="Appear in search and “Students near you”"
              checked={discoverable}
              onToggle={setDiscoverable}
              storageKey="campusfit-discoverable"
            />
            <ToggleRow
              label="Activity status"
              hint="Show when you're on a FitTrip"
              checked={activityStatus}
              onToggle={setActivityStatus}
              storageKey="campusfit-activity-status"
            />
          </div>
        </section>

        <section className="space-y-sm">
          <h2 className="px-base text-label-sm uppercase tracking-widest text-on-surface-variant">Blocked users</h2>
          <div className="overflow-hidden rounded-xl border border-black/5 bg-surface-container-lowest shadow-sm">
            {blocked.length === 0 && (
              <p className="p-md font-body-md text-body-md text-on-surface-variant">
                You haven't blocked anyone.
              </p>
            )}
            {blocked.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-surface-variant/30 p-md last:border-b-0"
              >
                <div>
                  <p className="font-body-md text-on-surface">{user.name}</p>
                  <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                    {user.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBlocked(prev => prev.filter(item => item.id !== user.id))}
                  className="rounded-full border border-outline-variant px-4 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition hover:bg-black/5 active:scale-95"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </section>

        <p className="pb-2 text-center font-label-sm text-label-sm text-on-surface-variant">
          Settings apply immediately and are stored on this device.
        </p>
      </main>
    </div>
  );
}
