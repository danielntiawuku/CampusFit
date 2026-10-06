import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, ScreenHeader } from '../components/ui';

/**
 * Production screen not present in the Stitch export — built from the same
 * tokens (warm cream, mint primary, 20px cards, Outfit type scale).
 * Reached from the dashboard / FitClips / explorer notification bells.
 */
interface Notice {
  id: string;
  icon: string;
  tone: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const NOTICES: Notice[] = [
  {
    id: 'n1',
    icon: 'military_tech',
    tone: 'bg-tertiary-container/20 text-tertiary',
    title: 'Badge unlocked',
    body: 'You earned “Campus Explorer” — 5 checkpoints visited.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'n2',
    icon: 'leaderboard',
    tone: 'bg-primary-container/15 text-primary',
    title: 'You moved up to #4',
    body: 'Adjoa Nyarko is 1,570 pts ahead. Keep scanning to close the gap.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n3',
    icon: 'groups',
    tone: 'bg-secondary-container/20 text-secondary',
    title: 'Morning Miles challenge',
    body: 'Your club is at 75% — 2 days left on the leaderboard.',
    time: '5h ago',
    unread: false,
  },
  {
    id: 'n4',
    icon: 'qr_code_scanner',
    tone: 'bg-primary-container/15 text-primary',
    title: 'New checkpoint nearby',
    body: '“Lake Loop Pier” (epic · 35 pts) was added at Campus Lake.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'n5',
    icon: 'verified_user',
    tone: 'bg-surface-container text-on-surface-variant',
    title: 'Verification approved',
    body: 'Your student status is verified — full leaderboard access unlocked.',
    time: 'Yesterday',
    unread: false,
  },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState(NOTICES);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visible = notices.filter(n => filter === 'all' || n.unread);
  const unreadCount = notices.filter(n => n.unread).length;

  function open(id: string) {
    setNotices(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  }

  function markAllRead() {
    setNotices(prev => prev.map(n => ({ ...n, unread: false })));
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Notifications"
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="font-label-md text-label-md text-primary disabled:opacity-40"
          >
            Mark all read
          </button>
        }
      />

      <main className="space-y-md px-container-padding pb-8">
        <div className="flex gap-xs">
          {(['all', 'unread'] as const).map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`chip ${filter === key ? 'data-[active=true]' : ''}`}
              data-active={filter === key}
            >
              {key === 'all' ? `All (${notices.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        <div className="space-y-sm">
          {visible.map((notice, index) => (
            <button
              key={notice.id}
              type="button"
              onClick={() => open(notice.id)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`card flex w-full items-start gap-sm p-md text-left animate-fade-up transition hover:shadow-card-lg active:scale-[0.99] ${
                notice.unread ? 'ring-1 ring-primary-container/40' : ''
              }`}
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${notice.tone}`}>
                <span className="material-symbols-outlined text-[22px]">{notice.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-xs">
                  <p className="truncate font-label-md text-label-md font-semibold">{notice.title}</p>
                  <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">
                    {notice.time}
                  </span>
                </div>
                <p className="font-label-sm text-label-sm font-normal leading-snug text-on-surface-variant">
                  {notice.body}
                </p>
              </div>
              {notice.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-container" />}
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <EmptyState
            icon="notifications_off"
            title="You're all caught up"
            message="New badges, challenges and checkpoint alerts will land here."
          />
        )}

        <button
          onClick={() => navigate('/settings')}
          className="w-full rounded-full border border-outline-variant/60 py-3 font-label-md text-label-md text-on-surface-variant transition hover:bg-black/5"
        >
          Manage notification preferences
        </button>
      </main>
    </div>
  );
}
