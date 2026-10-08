import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ScreenHeader } from '../components/ui';
import { fetchFitClips } from '../lib/api';
import type { FitClip } from '../lib/types';

interface Props {
  clipId: string;
}

export default function FitClipDetail({ clipId }: Props) {
  const navigate = useNavigate();
  const [clips, setClips] = useState<FitClip[]>([]);

  useEffect(() => {
    fetchFitClips()
      .then(setClips)
      .catch(() => setClips([]));
  }, []);

  const clip = clips.find(c => c.id === clipId);

  if (clips.length === 0) {
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <ScreenHeader title="Clip" onBack={() => navigate(-1)} />
        <div className="flex flex-1 items-center justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">progress_activity</span>
        </div>
      </div>
    );
  }
  if (!clip) {
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <ScreenHeader title="Clip" onBack={() => navigate(-1)} />
        <p className="px-container-padding py-xl text-center text-on-surface-variant">
          This clip could not be found.
        </p>
      </div>
    );
  }
  const authorName = clip.author?.full_name ?? 'Unknown';

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ScreenHeader
        title={authorName}
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            aria-label="More options"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest transition hover:opacity-80 active:scale-95"
          >
            <Icon name="more_vert" size={20} />
          </button>
        }
      />

      <main className="flex-1">
        {/* Full-width video/image card */}
        <div className="relative aspect-[9/16] bg-surface-container-highest/5 overflow-hidden">
          {/* Poster image */}
          <div className="absolute inset-0">
            {clip.video_url ? (
              <video
                className="w-full h-full object-cover"
                src={clip.video_url}
                poster={clip.thumbnail_url ?? undefined}
                playsInline
              />
            ) : (
            <img
              className="w-full h-full object-cover"
              alt={clip.caption}
              src={clip.thumbnail_url ?? `https://lh3.googleusercontent.com/aida-public/AB6AXuA${clip.id === 'f1' ? 'D1pVMiHv7fbfL-a4FHjYvJZtGduVg063tea3saDDSm0SOg3wPp7ZwxYjXxbsyyoAD5QWNT2xtjlpxBWrr0jQMXfTdHlcjejvwQXmytt-p4vqbcAvsEkZrHy1ND12QOsoUPJjIVr4O_feTu79_A-Z4m3wI8AoQ3Sk2I_hAwZ1oI0Xe5KDMoM6v67cnd5PaZBQ9VINxkNH5a-yuWSy0XES3MBpxnSkKroIfVeDPNmwSpuwEDOcsQ0APnySaWqJJLmVQ16ZQw3u6Lqz3' : clip.id === 'f2' ? 'AXg1ZT0vUkVC9YLGOsQE-j53G0riuATblaQ7xw19Hc3Zs9ucPhTfBHJx1DMg5CGycRoZDFkp4lctdvVWPkvOq5ttfPl5eHAr4Grg3XI-Tm8Hbt49LtNHsnot9dFx8vHg5Y-ICztgOa9pdglNlXf9Bvg1z2d0f4aZ1_fPpKINMypmXoO8AK_N0PRlOCpxoDvRj0KCBr5cEn76FU5jrXiLjwisVXu8fFOAvqZ3RBkip8sDiXIoneuvUNweTeQmeCfyPaKNAGqQN6jYse' : clip.id === 'f3' ? 'AJJ9oa8qGSHkkeZ7Wev7vystdGMXBS-ciWP5Vs437BsXHLDIeOR_PUn7KP5OGyJGyMBsak6V5wKMYGe0uq6NGQhGzofgQ_ehfmFL_9T6yT7Muc9IPfjBZUFdSuXhn780I7rJqxUtB-eHQ348QxCel3hKAR2r8wT8GD1cjZlzEBgha2j3HZbeBvDVzJ77U4JdfVLlGoSS5EXdQzoTzW9h9K0qQr6NyVcKh37JUQcvbCOZ9E4JBBqkQqEoy6SMICogGdl-HuLUMcgX1N' : 'AegEeYZto49uJ7YjtINoQYadSVDt-8Cwje0gyGF94GmJkSKaC3zuMU9bTUUp1AemCt9jawaJ_9vI8_iOYj9g5lWMRq9-3GUARpabSrRFL8sgJoLH-rQ-Wp87pbaCDIL44Kpyq-hsa3lHICApWzyNxcJOode-JwxexgYaPxTg9h3alg11DV4fH-M9Atd_TxPcspYZyUMLd-qVC-Uy5Dr_MIFsDOh7tBfB90zp9jf4-CaXmNp7Qaj2LG-WmdopszFxyBFlAKXrDSjy1'}.JPG`}
            />
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          {/* Play/pause overlay — tap toggles inline playback in place. Open-in-new affordance is on the feed card. */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              type="button"
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              aria-label="Play clip in place"
            >
              <Icon name="play_arrow" size={40} fill className="text-white" />
            </button>
          </div>

          {/* Duration badge */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-xs bg-black/40 backdrop-blur-md px-sm py-xs rounded-full">
            <Icon name="schedule" size={14} className="text-white" />
            <span className="font-label-sm text-label-sm text-white">0:32</span>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-md z-20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden bg-black/30">
                  <img
                    className="w-full h-full object-cover"
                    alt={authorName}
                    src={clip.author?.avatar_url ?? `https://lh3.googleusercontent.com/aida-public/AB6AXuCeHCMfLSjtblRgWxWglAMZqT2Ta-Kjp3uSsltvOM6QtNsY7CuVTLqhQlkSxHD_V6pDi0yv2KktbZBInD1X3B_dgsaAKN1447SD-YaTuDqwWtYoIbwZWDAaUP3uTyoXfGrYrXzzM8jVI6Yo4OgUdJqJKaKPWuH5-xeCkYM141USrE6bRuKIAF5MOorojY3WkWU-tImpUjXBqfeqtusjvgam4jv1_5LydKwAK8IMEfbIwtDlatQGtTZQA-S6qimJZZg3Zxp1sukcqCi.JPG`}
                  />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-white">@{authorName.toLowerCase().replace(/\s+/g, '')}</p>
                  <p className="font-label-sm text-label-sm text-white/60">{clip.created_at ? new Date(clip.created_at).toLocaleDateString() : '2 hours ago'}</p>
                </div>
              </div>
              {clip.likes_count > 0 && (
                <div className="flex items-center gap-sm bg-black/40 backdrop-blur-md px-sm py-xs rounded-full">
                  <Icon name="favorite" size={16} fill className="text-primary" />
                  <span className="font-label-sm text-label-sm text-white">{clip.likes_count}</span>
                </div>
              )}
            </div>
            <p className="mt-sm font-body-md text-body-md text-white/90 leading-snug">
              {clip.caption}
            </p>
          </div>
        </div>

        {/* Comments placeholder */}
        <div className="px-container-padding pb-8 space-y-md">
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-primary-container/15 text-primary flex items-center justify-center transition active:scale-90"
            >
              <Icon name="add_comment" size={18} />
            </button>
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/40 px-md text-label-md text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="space-y-sm">
            {[
              { name: 'Marcus Moves', text: 'Great form! Been trying to hit this trail too 🔥', time: '1h ago', likes: 24 },
              { name: 'ZenStudent', text: 'The morning fog makes this trail magical', time: '3h ago', likes: 18 },
            ].map((comment, i) => (
              <div key={i} className="flex gap-md p-md bg-surface-container-lowest rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt={comment.name}
                    src={`https://lh3.googleusercontent.com/aida-public/AB6AXuD${i === 0 ? '1pVMiHv7fbfL-a4FHjYvJZtGduVg063tea3saDDSm0SOg3wPp7ZwxYjXxbsyyoAD5QWNT2xtjlpxBWrr0jQMXfTdHlcjejvwQXmytt-p4vqbcAvsEkZrHy1ND12QOsoUPJjIVr4O_feTu79_A-Z4m3wI8AoQ3Sk2I_hAwZ1oI0Xe5KDMoM6v67cnd5PaZBQ9VINxkNH5a-yuWSy0XES3MBpxnSkKroIfVeDPNmwSpuwEDOcsQ0APnySaWqJJLmVQ16ZQw3u6Lqz3' : 'AXg1ZT0vUkVC9YLGOsQE-j53G0riuATblaQ7xw19Hc3Zs9ucPhTfBHJx1DMg5CGycRoZDFkp4lctdvVWPkvOq5ttfPl5eHAr4Grg3XI-Tm8Hbt49LtNHsnot9dFx8vHg5Y-ICztgOa9pdglNlXf9Bvg1z2d0f4aZ1_fPpKINMypmXoO8AK_N0PRlOCpxoDvRj0KCBr5cEn76FU5jrXiLjwisVXu8fFOAvqZ3RBkip8sDiXIoneuvUNweTeQmeCfyPaKNAGqQN6jYse'}.JPG`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-xs">
                    <p className="font-label-md text-label-md font-semibold">{comment.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{comment.time}</p>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs leading-snug">{comment.text}</p>
                  <div className="flex items-center gap-md mt-sm">
                    <button type="button" className="flex items-center gap-xs text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="favorite" size={16} />
                      <span>{comment.likes}</span>
                    </button>
                    <button type="button" className="flex items-center gap-xs text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="reply" size={16} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
