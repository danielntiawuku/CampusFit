import { useNavigate } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';

interface Notice {
  id: string;
  icon: string;
  tone: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface Props {
  notice: Notice;
}

export default function NotificationDetail({ notice }: Props) {
  const navigate = useNavigate();

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
