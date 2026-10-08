import { NavLink, useLocation } from 'react-router-dom';

/**
 * Shared bottom navigation, ported from the Stitch screens' floating pill bar
 * (the per-screen copies were stripped by scripts/convert_stitch.py so the bar
 * is rendered once here). Center action is the QR checkpoint scanner — the
 * thesis gamification loop's entry point.
 */

interface NavEntry {
  to: string;
  icon: string;
  label: string;
}

const ENTRIES: NavEntry[] = [
  { to: '/home', icon: 'dashboard', label: 'Home' },
  { to: '/explore', icon: 'directions_run', label: 'Spots' },
  { to: '/scan', icon: 'qr_code_scanner', label: 'Scan' },
  { to: '/clips', icon: 'play_circle', label: 'FitClips' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-md left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-full bg-inverse-surface px-sm py-xs shadow-lg shadow-primary/10"
      style={{ bottom: 'calc(16px + var(--cf-safe-bottom))' }}
    >
      {ENTRIES.map(entry => {
        const active =
          pathname === entry.to ||
          (entry.to !== '/home' && pathname.startsWith(entry.to));
        const isScan = entry.to === '/scan';

        if (isScan) {
          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              aria-label={entry.label}
              aria-current={active ? 'page' : undefined}
              className={`flex h-14 w-14 -translate-y-1 items-center justify-center rounded-full transition-transform active:scale-90 ${
                active ? 'bg-primary-container' : 'bg-primary-container/25'
              }`}
              style={{ boxShadow: '0 8px 20px rgba(30, 204, 139, 0.35)' }}
            >
              <span
                className="material-symbols-outlined text-on-surface"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {entry.icon}
              </span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={entry.to}
            to={entry.to}
            aria-label={entry.label}
            aria-current={active ? 'page' : undefined}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
              active
                ? 'scale-110 bg-surface-container-lowest text-inverse-surface'
                : 'text-surface-variant hover:text-surface-bright'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
            >
              {entry.icon}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
