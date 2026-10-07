import { useNavigate } from 'react-router-dom';
import { Icon, DifficultyPill, ScreenHeader } from '../components/ui';
import { DEMO_CHECKPOINTS, DIFFICULTY_MULTIPLIER } from '../lib/data';

interface Props {
  checkpointCode?: string;
}

export default function CheckpointDetail({ checkpointCode }: Props) {
  const navigate = useNavigate();
  const checkpoint = (checkpointCode
    ? DEMO_CHECKPOINTS.find(c => c.code.toUpperCase() === checkpointCode.toUpperCase())
    : DEMO_CHECKPOINTS[0])!;

  const nearby = DEMO_CHECKPOINTS
    .filter(c => c.id !== checkpoint.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const points = Math.round(checkpoint.base_points * DIFFICULTY_MULTIPLIER[checkpoint.difficulty]);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={checkpoint.name}
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={() => navigate('/scan')}
            aria-label="Scan another"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="qr_code_scanner" size={20} />
          </button>
        }
      />

      <main className="px-container-padding pb-8 space-y-lg">
        {/* Checkpoint hero card */}
        <section className="rounded-card overflow-hidden custom-shadow">
          <div className="aspect-[9/16] bg-surface-container-lowest relative">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-[260px] aspect-[9/16] bg-gradient-to-br from-primary/30 via-transparent to-tertiary/30 rounded-3xl blur-2xl" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-20 p-md">
              <DifficultyPill level={checkpoint.difficulty} />
              <h2 className="font-headline-lg text-headline-lg text-white mt-sm leading-tight">
                {checkpoint.name}
              </h2>
              <p className="font-label-sm text-label-sm text-white/70">{checkpoint.location}</p>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-card-gap">
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="star" size={18} className="text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Base points</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-primary">
              {checkpoint.base_points} <span className="font-label-md text-label-md text-on-surface-variant">pts</span>
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="trending_up" size={18} className="text-secondary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">With multiplier</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-secondary">
              {points} <span className="font-label-md text-label-md text-on-surface-variant">pts</span>
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="category" size={18} className="text-tertiary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Difficulty</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-tertiary">
              {checkpoint.difficulty.charAt(0).toUpperCase() + checkpoint.difficulty.slice(1)}
            </p>
          </div>
          <div className="rounded-card bg-surface-container-lowest p-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="event" size={18} className="text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface">Active</p>
          </div>
        </section>

        {/* Description */}
        <section className="rounded-card bg-surface-container-lowest p-md space-y-sm">
          <h4 className="font-title-md text-title-md text-on-surface">About this checkpoint</h4>
          <p className="font-label-md text-label-md text-on-surface-variant leading-snug">
            {checkpoint.description}
          </p>
          <div className="flex items-center gap-sm pt-sm border-t border-outline-variant/30">
            <Icon name="location_on" size={16} className="text-on-surface-variant" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {checkpoint.location} · {checkpoint.latitude?.toFixed(4) ?? '—'}, {checkpoint.longitude?.toFixed(4) ?? '—'}
            </span>
          </div>
        </section>

        {/* Nearby checkpoints */}
        <section className="space-y-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-title-md text-title-md">Nearby checkpoints</h4>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="font-label-md text-label-md text-primary"
            >
              View all
            </button>
          </div>
          <div className="space-y-sm">
            {nearby.map((cp) => (
              <button
                key={cp.id}
                type="button"
                onClick={() => navigate('/scan?code=' + encodeURIComponent(cp.code))}
                className="flex items-center gap-md p-md bg-surface-container-lowest soft-border rounded-xl cursor-pointer transition hover:shadow-card active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center shrink-0">
                  <Icon name="location_on" size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{cp.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{cp.location}</p>
                </div>
                <DifficultyPill level={cp.difficulty} />
                <span className="font-label-md text-label-md font-semibold text-primary">
                  {Math.round(cp.base_points * DIFFICULTY_MULTIPLIER[cp.difficulty])}p
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Scan action */}
        <button
          type="button"
          onClick={() => navigate('/scan?code=' + encodeURIComponent(checkpoint.code))}
          className="w-full h-14 bg-primary text-on-primary rounded-full font-title-md text-title-md shadow-md transition active:scale-[0.97] flex items-center justify-center gap-sm"
        >
          <Icon name="check" size={22} fill style={{ fontVariationSettings: "'FILL' 1" }} />
          Claim {points} pts
        </button>

        {/* Tips */}
        <div className="rounded-card bg-primary-container/10 border border-primary/5 p-md space-y-sm">
          <div className="flex items-start gap-sm">
            <Icon name="lightbulb" size={18} className="text-primary mt-0.5" />
            <p className="font-label-sm text-label-sm text-on-primary-container leading-snug">
              Check the code on the physical sign at the location. Scanned codes are valid for 8 hours — no double-dipping.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
