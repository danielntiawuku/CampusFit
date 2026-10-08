import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchNotices } from '../lib/notifications';

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
    icon: 'bar_chart',
    tone: 'bg-primary-container/20 text-primary',
    title: 'New badge earned',
    body: 'You earned the Points 2500 badge for reaching 2,500 points across all activities.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n2',
    icon: 'leaderboard',
    tone: 'bg-tertiary-container/20 text-on-tertiary-container',
    title: 'You moved up the leaderboard',
    body: 'You are now #7 on the weekly leaderboard — 320 points behind the top spot.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'n3',
    icon: 'check_circle',
    tone: 'bg-error-container/20 text-error',
    title: 'Checkpoint scanned',
    body: 'You scanned North Quadrangle Gate (NQG-01) and earned 15 points.',
    time: '2 days ago',
    unread: false,
  },
  {
    id: 'n4',
    icon: 'groups',
    tone: 'bg-surface-container-low text-on-surface-variant',
    title: 'Club update',
    body: 'Zen Collective posted a new weekend run — join the club to see more.',
    time: '3 days ago',
    unread: false,
  },
];

export default function NotificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[] | null>(null);

  useEffect(() => {
    void fetchNotices(profile?.id ?? null)
      .then((ns) => setNotices(ns.length ? ns : NOTICES))
      .catch(() => setNotices(NOTICES));
  }, [profile?.id]);

  const notice = notices === null ? null : notices.find(n => n.id === id) ?? notices[0] ?? null;

  if (!notice) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Notification" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">progress_activity</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Notification"
        onBack={() => navigate(-1)}
      />

      <main className="px-container-padding pb-8 space-y-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full flex items-center gap-sm p-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-left transition hover:shadow-card active:scale-[0.99]"
        >
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${notice.tone}`}>
            <Icon name={notice.icon} size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md font-semibold">{notice.title}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs leading-snug">
              {notice.body}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">
              {notice.time}
            </p>
          </div>
        </button>

        <div className="space-y-xs">
          <div className="h-2 w-full rounded-full bg-tertiary-container/30" />
          <div className="h-2 w-3/5 rounded-full bg-tertiary-container/20" />
        </div>

        <div className="flex gap-md">
          <button
            type="button"
            onClick={() => navigate('/leaderboard')}
            className="flex-1 rounded-full bg-primary-container text-on-primary-container py-md font-label-md text-label-md transition active:scale-95"
          >
            View leaderboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/badges')}
            className="flex-1 rounded-full bg-surface-container-lowest text-on-surface py-md font-label-md text-label-md border border-outline-variant/40 transition active:scale-95"
          >
            View badges
          </button>
        </div>
      </main>
    </div>
  );
}
