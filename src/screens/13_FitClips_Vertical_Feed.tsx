/* eslint-disable */
/**
 * Screen 13 — FitClips Vertical Feed
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/13_FitClips_Vertical_Feed.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Play/pause overlay for a clip. */
function ClipPlay() {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      onClick={() => setPlaying(v => !v)}
      aria-label={playing ? 'Pause clip' : 'Play clip'}
      className="absolute inset-0 flex items-center justify-center z-20"
    >
      <span
        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all"
        style={{ opacity: playing ? 0.35 : 1 }}
      >
        <span
          className="material-symbols-outlined text-[40px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </span>
    </button>
  );
}

/** Optimistic like button with count. */
function ClipLike({ initial }: { initial: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  return (
    <button
      onClick={() => {
        setLiked(v => !v);
        setCount(c => (liked ? c - 1 : c + 1));
      }}
      aria-pressed={liked}
      className="group flex flex-col items-center"
    >
      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-base group-active:scale-125 transition-transform">
        <span
          className="material-symbols-outlined transition-colors"
          style={{
            color: liked ? '#1ECC8B' : '#ffffff',
            fontVariationSettings: `'FILL' ${liked ? 1 : 0}`,
          }}
        >
          favorite
        </span>
      </div>
      <span className="font-label-md text-label-md text-white">{count}</span>
    </button>
  );
}

export default function Stitch13_FitClips_Vertical_Feed() {
  const navigate = useNavigate();

  return (
    <div className="feed-screen min-h-[100dvh]">


<header className="w-full top-0 sticky bg-[#0A0C0B] z-50">
<div className="flex items-center justify-between px-container-padding py-md w-full max-w-screen-xl mx-auto">
<div className="flex flex-col">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-white flex items-center gap-xs">
                    FitClips
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
</h1>
<div className="flex items-center gap-xs text-on-surface-variant/70 mt-base">
<span className="material-symbols-outlined text-[16px]">block</span>
<p className="font-label-sm text-label-sm">Comments are off — fitness journeys are personal</p>
</div>
</div>
<div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full border border-outline/20 overflow-hidden active:scale-95 transition-transform cursor-pointer">
<img className="w-full h-full object-cover" alt="A professional close-up studio portrait of a fit university student, soft cinematic lighting, minimalist aesthetic with deep charcoal and mint green accents. High-quality photography, sharp focus, serene and confident expression." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeHCMfLSjtblRgWxWglAMZqT2Ta-Kjp3uSsltvOM6QtNsY7CuVTLqhQlkSxHD_V6pDi0yv2KktbZBInD1X3B_dgsaAKN1447SD-YaTuDqwWtYoIbwZWDAaUP3uTyoXfGrYrXzzM8jVI6Yo4OgUdJqJKaKPWuZH5-xeCkYM141USrE6bRuKIAF5MOorojY3WkWU-tImpUjXBqfeqtusjvgam4jv1_5LydKwAK8IMEfbIwtDlatQGtTZQA-S6qimJZZg3Zxp1sukcqCi"/>
</div>
</div>
</header>

<main className="video-feed px-container-padding pb-xl">
<div className="flex flex-col gap-md">

<section className="video-card relative w-full h-[618px] rounded-[20px] overflow-hidden bg-surface-container-highest/5 border border-white/5">
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>

<div className="absolute inset-0 flex items-center justify-center glow-green">
<div className="w-full h-full bg-[#0E1210] relative">
<img className="w-full h-full object-cover opacity-60" alt="A POV shot of a runner's perspective on a lush, green university forest trail at dawn. The morning light filters through trees in a soft mint green glow. High-performance athletic aesthetic, moody dark tones, minimalist composition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJJ9oa8qGSHkkeZ7Wev7vystdGMXBS-ciWP5Vs437BsXHLDIeOR_PUn7KP5OGyJGyMBsak6V5wKMYGe0uq6NGQhGzofgQ_ehfmFL_9T6yT7Muc9IPfjBZUFdSuXhn780I7rJqxUtB-eHQ348QxCel3hKAR2r8wT8GD1cjZlzEBgha2j3HZbeBvDVzJ77U4JdfVLlGoSS5EXdQzoTzW9h9K0qQr6NyVcKh37JUQcvbCOZ9E4JBBqkQqEoy6SMICogGdl-HuLUMcgX1N"/>
</div>
</div>

<ClipPlay />

<div className="absolute top-md right-md z-20 bg-black/40 backdrop-blur-md px-xs py-base rounded-lg border border-white/10">
<span className="font-label-sm text-label-sm text-white">0:15</span>
</div>

<div className="absolute bottom-0 left-0 w-full p-md z-20 flex justify-between items-end">
<div className="flex flex-col gap-xs max-w-[70%]">
<div className="flex items-center gap-xs">
<div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
<img className="w-full h-full object-cover" alt="A small circular avatar of a student athlete wearing a minimalist grey performance headband, clean lighting, CampusFit brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC689nPCa6lxDt96l9E8PB8DCK7PwZn7lPTM4isJyqe-gH48aX-eda_Oe5vDaOckPdLt7-RfWtPIUlZfhRaaGuwCmxSWjfJbwc-XZxpI0hNQzWbWH7_iwUPdoduEy-YutohNCb-vsMCzG4pfMk_pUGb3MibuctT6OfKL2y968FeXnO_KnU7J7KD9tbt57HZt_LXnL1YdUiiIdbw03owxnWJeXTxYy230CpocxHPvyQZSeNnfjJvn-XwbTcStxofT1dyA-fFG1dj2fE8"/>
</div>
<span className="font-label-md text-label-md text-white">@fit_student</span>
</div>
<div className="flex">
<span className="bg-primary-container/30 text-primary-fixed font-label-sm text-label-sm px-sm py-base rounded-full border border-primary-container/50">North Loop Crew</span>
</div>
<p className="font-body-md text-body-md text-white/90 line-clamp-2">Early morning run vibes on the forest trail. 🏃‍♂️💨 #CampusFit</p>
</div>

<div className="flex flex-col items-center gap-xs">
<ClipLike initial={24} />
</div>
</div>
</section>

<section className="video-card relative w-full h-[618px] rounded-[20px] overflow-hidden bg-surface-container-highest/5 border border-white/5">
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>
<div className="absolute inset-0 flex items-center justify-center glow-amber">
<div className="w-full h-full bg-[#0E1210] relative">
<img className="w-full h-full object-cover opacity-60" alt="A close-up shot of a weightlifter's hands applying chalk in a high-end university gym. Golden sunset light streaming through windows creates a warm amber glow. Athletic, professional, minimalist mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv8IaM0tIrqI4tMf7P9jndcG9A6pWVcRMVZlyjB8BLB5g6lmGw-AYCyosuhAxrttUREDhxgmo9r3gT8JilcuaiSIZwaPzIb_APfuqf18xyTeJozr87xmEAKOPEUqS6WhrLbLDI7FB_68lZNzpKB5CXIFLbNFflaCEKNMwUBX7BokjV-PmJPAq8kSl44Rd6_cBFTF_2AQqMsAPLbnLu5sAbERaqdV7NsMonTFA9VJ9YTKwxotJM5uO3fe8sepHYnf4tZc6tMICKf_RM"/>
</div>
</div>
<ClipPlay />
<div className="absolute top-md right-md z-20 bg-black/40 backdrop-blur-md px-xs py-base rounded-lg border border-white/10">
<span className="font-label-sm text-label-sm text-white">0:24</span>
</div>
<div className="absolute bottom-0 left-0 w-full p-md z-20 flex justify-between items-end">
<div className="flex flex-col gap-xs max-w-[70%]">
<div className="flex items-center gap-xs">
<div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
<img className="w-full h-full object-cover" alt="A portrait of a female student in athletic wear, warm studio lighting, modern minimalist fitness style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCNLNVWnZdK3eWVL9pgKJmbR2c4gyqLJ3txfKSiOG20N0kyhqhVyjuXYTBJ2MkPKYuaFNzyZj6XkVUFdFflVCktJ8ecs0UaybYMTeb1rCHxbKL1bBCrZQushLeZ_GjkB-HL9bMRCBa0IcBRbwkOmk3kxRw4YprpRCp6gniRZPhFXfAfVOczP9nlsXTGOh5bLAPGgWac-U5jv07ozzWAT5PhnvUrz2y5oh2SIA9TYJx0A02kua_QTbYUUZb37jqEMsHVWWEWLQi7htU"/>
</div>
<span className="font-label-md text-label-md text-white">@alex_lifts</span>
</div>
<div className="flex">
<span className="bg-secondary-container/30 text-secondary-fixed font-label-sm text-label-sm px-sm py-base rounded-full border border-secondary-container/50">Iron Society</span>
</div>
<p className="font-body-md text-body-md text-white/90 line-clamp-2">New PB today! Consistency is the only secret. 🏋️‍♀️✨</p>
</div>
<div className="flex flex-col items-center gap-xs">
<ClipLike initial={156} />
</div>
</div>
</section>

<section className="video-card relative w-full h-[618px] rounded-[20px] overflow-hidden bg-surface-container-highest/5 border border-white/5">
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>
<div className="absolute inset-0 flex items-center justify-center glow-purple">
<div className="w-full h-full bg-[#0E1210] relative">
<img className="w-full h-full object-cover opacity-60" alt="A serene yoga studio at dusk with purple ambient lighting. A student is seen in a silhouette yoga pose. Soft, calm, meditative atmosphere with minimalist decor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAHYevenDSI_xsH-v3E9s8NuCmI73F7M41FMyN5n5C84UyTh-HCPXLx_1gM-T3DWdd0emgSvZk4N1FgcEaPTBm5HRMKcTTlAtQ4Lqu6UzYsmXPNzMS5xRIgC_bj0NqUnADWumIXl3kHzArfU0nyzbBCRE6-1-LHpt2HLOpxjcFEi1HkKLFSPvka1pF_VKNhxdPEojZKniHdb07ynEQcXUbZJiR5Yo8A76RSNZos40efQUxJ9UTG0Dn4RzRRFBfGc4_u81YZh5XcW3H"/>
</div>
</div>
<ClipPlay />
<div className="absolute top-md right-md z-20 bg-black/40 backdrop-blur-md px-xs py-base rounded-lg border border-white/10">
<span className="font-label-sm text-label-sm text-white">0:45</span>
</div>
<div className="absolute bottom-0 left-0 w-full p-md z-20 flex justify-between items-end">
<div className="flex flex-col gap-xs max-w-[70%]">
<div className="flex items-center gap-xs">
<div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
<img className="w-full h-full object-cover" alt="Avatar of a student with a peaceful expression, soft purple lighting, high-end digital portrait style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXczffegMLmPjvP84vRMRye8EFYFGBmOSpAjA5qn5DS7B_OZFl5g1fxFlKEhbnE7Yit0qDdwDFytfgM8gCInLftOx4pcD1rzvbXkr5KUmi0k2tJKJDfJq0AUUnd9XG3kEnNoL3gzan2JJLez_b9Oy7H_iARm3_gqY3pjKNbxu-QSzTa-dA0bieSfWahfSZkO28SXcRb9fCXcFwvUxG1j1Af5KffWBly7pXzU4zcqqf2wAhBRSR1Uxvoc0a0U1Kpt0NATWeK37HnIPZ"/>
</div>
<span className="font-label-md text-label-md text-white">@mindful_flow</span>
</div>
<div className="flex">
<span className="bg-tertiary-container/30 text-tertiary-fixed font-label-sm text-label-sm px-sm py-base rounded-full border border-tertiary-container/50">Zen Collective</span>
</div>
<p className="font-body-md text-body-md text-white/90 line-clamp-2">Sunday evening decompression flow. Taking care of the mind too. 🧘‍♀️💜</p>
</div>
<div className="flex flex-col items-center gap-xs">
<ClipLike initial={82} />
</div>
</div>
</section>
</div>
</main>


    </div>
  );
}
