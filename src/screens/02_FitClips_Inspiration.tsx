/* eslint-disable */
/**
 * Screen 02 — FitClips Inspiration
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/02_FitClips_Inspiration.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Like button with optimistic counter — shared shape for both slides. */
function LikeButton({ initial }: { initial: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  return (
    <div
      className="flex flex-col items-center group cursor-pointer"
      onClick={() => {
        setLiked(v => !v);
        setCount(c => (liked ? c - 1 : c + 1));
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          setLiked(v => !v);
          setCount(c => (liked ? c - 1 : c + 1));
        }
      }}
    >
      <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-xs group-active:scale-90 transition-transform">
        <span
          className={`material-symbols-outlined ${liked ? 'text-secondary-container' : 'text-white'}`}
          style={{ fontVariationSettings: `'FILL' ${liked ? 1 : 0}`, transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)', transform: liked ? 'scale(1.15)' : 'scale(1)' }}
        >
          favorite
        </span>
      </div>
      <span className="font-label-md text-label-md text-white">
        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </div>
  );
}

export default function Stitch02_FitClips_Inspiration() {
  const navigate = useNavigate();

  return (
    <div className="feed-screen min-h-[100dvh]">


<header className="flex justify-between items-center w-full sticky top-0 z-40 bg-transparent px-container-padding pt-md">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
<img className="w-full h-full object-cover" alt="A professional headshot of a diverse university student smiling warmly, captured in soft natural lighting. The student wears athletic gear, and the background is a blurred university campus courtyard. The visual style is crisp, high-resolution, and matches a clean, modern wellness app aesthetic with vibrant yet natural color tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa754YOsmLGfY3XkkxovTgFpIxS9hvvfyxjqWpH-qzctSnnHVhB5FSQ2T2lNd3HvOkiVYdN5HdqtjQVZIuwcNa4zod4f59O0H7m_N903u-SJAcyyDyXkW8GKL3CmUkymFz7cJy3nmtDZaKzXOyv9ALq661-2ImxqbqZ_YXjB4d_Pp5ujIIzKSMntz2Ss47IgKctPNu3KcNzZGxOTjd3CpY_cAGxgD23w-hNVw-iTL_YLE4v6OGwB5k3VaG9qyTnRzwIUNHI5-1ljWe"/>
</div>          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-white">FitClips</h1>
</div>
<button onClick={() => navigate('/clips')} className="material-symbols-outlined text-white p-xs hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform">
            grid_view
        </button>
<button onClick={() => navigate('/notifications')} className="material-symbols-outlined text-white p-xs hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform">
            notifications
        </button>
</header>

<main className="video-container">

<section className="video-slide">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover" alt="A cinematic, high-speed shot of a female student athlete sprinting on a professional blue running track during a golden hour sunset. The lighting is dramatic, casting long shadows and a warm amber glow over the scene. The image quality is extremely high, resembling a professional fitness commercial with a moody, dark-toned background as requested for the FitClips experience." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD1pVMiHv7fbfL-a4FHjYvJZtGduVg063tea3saDDSm0SOg3wPp7ZwxYjXxbsyyoAD5QWNT2xtjlpxBWrr0jQMXfTdHlcjejvwQXmytt-p4vqbcAvsEkZrHy1ND12QOsoUPJjIVr4O_feTu79_A-Z4m3wI8AoQ3Sk2I_hAwZ1oI0Xe5KDMoM6v67cnd5PaZBQ9VINxkNH5a-yuWSy0XES3MBpxnSkKroIfVeDPNmwSpuwEDOcsQ0APnySaWqJJLmVQ16ZQw3u6Lqz3"/>
</div>

<div className="absolute inset-0 z-10 glass-overlay flex flex-col justify-end px-container-padding pb-40">
<div className="flex flex-row justify-between items-end gap-md">

<div className="flex-1 pb-xs">
<div className="flex items-center gap-xs mb-sm">
<div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
<img className="w-full h-full object-cover" alt="Close-up portrait of a young male student athlete with a focused expression, wearing a sleek black performance tank top. The lighting is high-contrast and moody, highlighting sweat and determination. The background is a dimly lit high-end university gym, maintaining the sophisticated dark mode aesthetic of the design system." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkrpthDvfb9MnkH_InXTI4SdOjUyYDuuKVTGLenAGD9gi_Za8EqVYbmgm2ylhXjl7GJHRzhlQrtZiD9euJMWJwO34QUBJSVyJkruV7RcZ7lNXbogFWst8D8M_FV10U9kQGdXcrfJXJ1bbFnFrqwRqTXGKJ2qqMoA5Ln2yWDPR6AggdFase48rFckAjNOj7lvFZ4pZg05vYENeuIwEUb1JID-Y-VW6IGtKazXuybmC6R1_a9hykf-JJw0kzOQbKqEXuLJZJ5zMlYyGt"/>
</div>
<div>
<p className="font-title-md text-title-md text-white">@MarcusMoves</p>
<p className="font-label-sm text-label-sm text-primary-fixed">Morning Intervals • 5:30 AM</p>
</div>
</div>
<p className="font-body-md text-body-md text-white/90 line-clamp-2 max-w-[80%]">
                            Pushing through the morning fog at the campus stadium. Consistency is the only secret. #StudentAthlete #MorningGrind
                        </p>
<div className="mt-md flex gap-xs">
<span className="bg-primary/20 text-primary-fixed-dim px-sm py-xs rounded-full font-label-sm text-label-sm backdrop-blur-md">Cardio</span>
<span className="bg-tertiary/20 text-tertiary-fixed-dim px-sm py-xs rounded-full font-label-sm text-label-sm backdrop-blur-md">Track</span>
</div>
</div>

<div className="flex flex-col items-center gap-lg">
<div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/clips')}>
<div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-xs group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-white">chat_bubble</span>
</div>
<span className="font-label-md text-label-md text-white">84</span>
</div>
<div className="flex flex-col items-center group cursor-pointer" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => undefined)}>
<div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-xs group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-white">share</span>
</div>
<span className="font-label-md text-label-md text-white">Share</span>
</div>
<LikeButton initial={1200} />
</div>
</div>
</div>
</section>

<section className="video-slide">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover" alt="A serene, wide-angle shot of a student practicing advanced yoga poses in a modern, minimalist university studio with floor-to-ceiling windows. Outside, the twilight sky transitions from deep purple to indigo. The interior is dimly lit with warm, localized accent lighting, creating a calm, high-performance atmosphere consistent with the warm minimalist brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXg1ZT0vUkVC9YLGOsQE-j53G0riuATblaQ7xw19Hc3Zs9ucPhTfBHJx1DMg5CGycRoZDFkp4lctdvVWPkvOq5ttfPl5eHAr4Grg3XI-Tm8Hbt49LtNHsnot9dFx8vHg5Y-ICztgOa9pdglNlXf9Bvg1z2d0f4aZ1_fPpKINMypmXoO8AK_N0PRlOCpxoDvRj0KCBr5cEn76FU5jrXiLjwisVXu8fFOAvqZ3RBkip8sDiXIoneuvUNweTeQmeCfyPaKNAGqQN6jYse"/>
</div>
<div className="absolute inset-0 z-10 glass-overlay flex flex-col justify-end px-container-padding pb-40">
<div className="flex flex-row justify-between items-end gap-md">
<div className="flex-1 pb-xs">
<div className="flex items-center gap-xs mb-sm">
<div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
<img className="w-full h-full object-cover" alt="Portrait of a serene female university student with her hair tied back, wearing elegant purple yoga attire. She is sitting in a peaceful meditation pose. The lighting is soft and ethereal, emphasizing the calm and supportive companion vibe of the app. The colors are muted and professional." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmsMAJ4I3Kvzt9twrBbvaTfXmW5DOVv0IAJfKwSb4n_11BiFv5xGY38ixUIOgnTRrOpfCBgULapawyRYqzyoONlEx_sKLoHckRFWe0elHL_D-WDZuOnJaUK17pVkMC1Y6b3uThDj5HHtjfNb5v5wr4MgdpdAAOuWTLHumJPU-jmfk3kXaEdh-7bUuqJWLWLaoQFDCdcZikCxyBLhhsfNPIeT38zpUxhVZ3IC5U0LrBXMtq9n-7HvTmMT2uk974YEM7wV-7bl2uGl_F"/>
</div>
<div>
<p className="font-title-md text-title-md text-white">@ZenStudent</p>
<p className="font-label-sm text-label-sm text-tertiary-fixed-dim">Evening Flow • Finals Week</p>
</div>
</div>
<p className="font-body-md text-body-md text-white/90 line-clamp-2 max-w-[80%]">
                            How I survive midterms: 20 minutes of focus, 1 hour of flow. Mind over matter.
                        </p>
<div className="mt-md flex gap-xs">
<span className="bg-tertiary/20 text-tertiary-fixed-dim px-sm py-xs rounded-full font-label-sm text-label-sm backdrop-blur-md">Mindfulness</span>
<span className="bg-secondary/20 text-secondary-fixed-dim px-sm py-xs rounded-full font-label-sm text-label-sm backdrop-blur-md">Recovery</span>
</div>
</div>
<div className="flex flex-col items-center gap-lg">
<div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/clips')}>
<div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-xs group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-white">chat_bubble</span>
</div>
<span className="font-label-md text-label-md text-white">215</span>
</div>
<div className="flex flex-col items-center group cursor-pointer" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => undefined)}>
<div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-xs group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-white">share</span>
</div>
<span className="font-label-md text-label-md text-white">Share</span>
</div>
<LikeButton initial={3400} />
</div>
</div>
</div>
</section>
</main>


    </div>
  );
}
