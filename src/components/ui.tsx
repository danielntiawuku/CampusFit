import type { CSSProperties, ReactNode } from 'react';

/** Icon wrapper around Material Symbols (loaded in index.html). */
export function Icon({
  name,
  size = 24,
  fill = false,
  className = '',
  style,
}: {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/** Circle avatar with initials fallback — used across profile/social screens. */
export function Avatar({
  name,
  url,
  size = 44,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--cf-mint), var(--cf-purple))',
        color: '#06231a',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {initials || '?'}
    </div>
  );
}

/** Screen title used on secondary pages. */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="topbar">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5"
        >
          <Icon name="arrow_back" size={22} />
        </button>
      )}
      <h1 className="flex-1 truncate text-title-md font-semibold">{title}</h1>
      {right}
    </header>
  );
}

/** Circular progress ring for the steps card. */
export function ProgressRing({
  value,
  max,
  size = 148,
  stroke = 12,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Empty state used by list screens. */
export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
      <div
        className="grid h-16 w-16 place-items-center rounded-full"
        style={{ background: 'rgba(30,204,139,0.14)', color: 'var(--cf-mint-deep)' }}
      >
        <Icon name={icon} size={30} />
      </div>
      <p className="text-title-md font-semibold">{title}</p>
      <p className="text-body-md" style={{ color: 'var(--cf-ink-variant)' }}>
        {message}
      </p>
    </div>
  );
}

/** Inline alert used by forms. */
export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success'; children: ReactNode }) {
  const ok = kind === 'success';
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className="flex items-start gap-2 rounded-2xl px-4 py-3 text-body-md"
      style={{
        background: ok ? 'rgba(30,204,139,0.12)' : 'rgba(186,26,26,0.10)',
        color: ok ? 'var(--cf-mint-deep)' : 'var(--cf-error)',
        border: `1px solid ${ok ? 'rgba(30,204,139,0.35)' : 'rgba(186,26,26,0.3)'}`,
      }}
    >
      <Icon name={ok ? 'check_circle' : 'error'} size={20} />
      <span>{children}</span>
    </div>
  );
}

/** Difficulty pill shared by checkpoints and trips. */
export function DifficultyPill({ level }: { level: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    easy: { bg: 'rgba(30,204,139,0.16)', fg: '#006c47', label: 'Easy' },
    medium: { bg: 'rgba(245,166,35,0.18)', fg: '#835500', label: 'Medium' },
    hard: { bg: 'rgba(192,126,255,0.18)', fg: '#641ea1', label: 'Hard' },
    epic: { bg: 'rgba(186,26,26,0.14)', fg: '#93000a', label: 'Epic' },
  };
  const c = map[level] ?? map.easy;
  return (
    <span
      className="rounded-full px-2.5 py-1 text-label-sm font-semibold"
      style={{ background: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  );
}
