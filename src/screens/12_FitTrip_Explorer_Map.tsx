/* eslint-disable */
/**
 * Screen 12 — FitTrip Explorer Map
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/12_FitTrip_Explorer_Map.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useNavigate } from 'react-router-dom';

export default function Stitch12_FitTrip_Explorer_Map() {
  const navigate = useNavigate();
  return (
    <>


<div className="fixed inset-0 z-0">

<div className="w-full h-full opacity-60 grayscale-[0.2]" data-alt="A stylized digital bird's-eye view map of a modern university campus at night. The buildings are represented as subtle dark gray and deep charcoal blocks. Roads and paths are outlined in dark green tints. The lighting is low-key with a high-contrast aesthetic, featuring glowing accents in mint and purple that highlight active student zones. The mood is kinetic and calm, like a high-tech athletic HUD." data-location="Stanford University" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIZZ5fd7CQvJvIADG20He8BSZHR1YXxXj5587e4fo9EJ5hRw3Qv4PEe_qon_GM4dNuXzpFs3oJhmRpGtQEpJh-R4XVrMwSjPH_6tzI5LZJ3Rwm6jV6oMoPniSyvDmFcvdUlAo-c9H6xIfyk3MhUbANXLz2nUDSrzOgSPSmhAfNxhcIOyxa4XsgSU4E45hkf3Zbr2WeRTfGTs5W7jcIlPfpnhsafx_kLHZV1Bj2G_BKB19HwparslHGHLt5rg44iKgmoo5mmH8cVGJ3')" }}>
</div>

<svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">

<filter id="glow">
<feGaussianBlur result="coloredBlur" stdDeviation="4"></feGaussianBlur>
<feMerge>
<feMergeNode in="coloredBlur"></feMergeNode>
<feMergeNode in="SourceGraphic"></feMergeNode>
</feMerge>
</filter>

<path d="M 100,500 L 150,450 L 250,400 L 300,320 L 280,200 L 350,150" fill="none" filter="url(#glow)" opacity="0.8" stroke="#1ECC8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>

<circle cx="120" cy="300" fill="rgba(126, 60, 187, 0.1)" r="60" stroke="rgba(126, 60, 187, 0.4)" strokeDasharray="4,4"></circle>

<circle cx="320" cy="450" fill="rgba(254, 174, 44, 0.1)" r="80" stroke="rgba(254, 174, 44, 0.4)" strokeDasharray="4,4"></circle>
</svg>

<div className="absolute inset-0 z-10 pointer-events-none">

<div className="absolute" style={{ top: "320px", left: "300px" }}>
<div className="relative flex items-center justify-center">
<div className="w-4 h-4 bg-primary-container rounded-full border-2 border-white"></div>
<div className="absolute w-8 h-8 bg-primary-container/30 rounded-full pulse-animation"></div>
</div>
</div>

<div className="absolute" style={{ top: "500px", left: "100px" }}>
<div className="flex flex-col items-center">
<div onClick={() => navigate('/scan')} className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform">
<span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
</div>
<span className="mt-xs text-[10px] font-label-sm text-white bg-black/40 px-xs py-[2px] rounded-full">1</span>
</div>
</div>

<div onClick={() => navigate('/scan')} className="absolute cursor-pointer" style={{ top: "400px", left: "250px" }}>
<div className="flex flex-col items-center active:scale-95 transition-transform">
<div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(254,174,44,0.6)] animate-pulse">
<span className="material-symbols-outlined text-on-secondary-container text-md">flag</span>
</div>
<span className="mt-xs text-[10px] font-label-sm text-white bg-secondary px-xs py-[2px] rounded-full">NEXT</span>
</div>
</div>

<div className="absolute" style={{ top: "150px", left: "350px" }}>
<div className="flex flex-col items-center">
<div onClick={() => navigate('/leaderboard')} className="w-8 h-8 bg-surface-variant/40 border border-outline-variant rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-outline-variant text-sm">lock</span>
</div>
</div>
</div>

<div className="absolute flex items-center gap-xs bg-black/60 px-sm py-xs rounded-full border border-white/10" style={{ top: "220px", left: "140px" }}>
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border border-white bg-surface-dim overflow-hidden">
<img className="w-full h-full object-cover" alt="A diverse group of university students wearing athletic gear, shown in a small, stylized profile circle. Clean lighting, soft shadows, focusing on modern sportswear." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqfSvFgKs_JFj_XHCHOP-knWjLw5xlJ4hL1WQBQN3UKWvBDl0wrudHOfGKzl67NPMrB9R7fzGvQjIJaOSSXlgSwC8BeP3Nu8dD5fehG7aEB1Wx12BuniRmIP33ET8A33O_Q6yFk3v4YGI6ShfqOM2C5D95guDNrBC7Ynkjjw2SCHdH0OW6CeVmY7Id2MXKQRY-UQXX4ilj03Ep1Buz_EYpFmZw1OYhzU6Hk9-HmrlpS77qBWPeqXensU_F3IjjanCiLch5OppzsUt4"/>
</div>
<div className="w-6 h-6 rounded-full border border-white bg-surface-dim overflow-hidden">
<img className="w-full h-full object-cover" alt="A side profile of a male student athlete with a focused expression, wearing a moisture-wicking green headband." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS59466AYsD0emXAPgDoqvpuJr9T9nd7qvEFdLSqRJNLdPklPeusIRSfH8UZXCAIEeKB5efANIBWvftP_0I6YfMI6VMG4tK86YtjbRb1wO2DdGN5DuRow4CiHxZ1aeq8wOhaoeRQJGVAXjwlNmWmxgNIvt4gAP3vuHNdZgw08c5o50gd4d0i0ygtExIy2Xl_gsE_KfJgwsr4NnHSyXXGhLXY4y1kSKASDtmHwUY2qw20iTruyutfdADVPyFMnzsl0oEYEN5vmT1Mpt"/>
</div>
</div>
<span className="text-white text-[10px] font-label-sm whitespace-nowrap">Morning Run Club</span>
</div>

<div className="absolute" style={{ top: "290px", left: "110px" }}>
<div className="w-6 h-6 rounded-full border-2 border-tertiary-container shadow-lg overflow-hidden bg-tertiary">
<img className="w-full h-full object-cover" alt="A portrait of a smiling female student wearing sports earbuds, set against a blurred morning campus background with soft purple light flares." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1fGCV2sbpEtA3tY4pdIFdCcjj0uED96aA9dwQRNzCvaodEgvuV63CHlhlQ4tu9UFtxCjNlIAxbE5cMxrclmKSi24QJ61hatLyBDcZelqSf0bNt2z-rpaCizaUIEUY9bOKI5QyCU1xUCgfA1VR4ihZj50cYsjpf6Fkdei5WF71c45byjXlQ3HiDSAHvSoqGLT2qys2OzS7znOqYNAnXo4UmszMkTAoy4Dy9unowBhnO2YIWtOo7coz2xteZy3QmyteFvMIvUnBAwUy"/>
</div>
</div>

<div className="absolute" style={{ top: "440px", left: "310px" }}>
<div className="w-6 h-6 rounded-full border-2 border-secondary-container shadow-lg overflow-hidden bg-secondary">
<img className="w-full h-full object-cover" alt="Close up shot of a student checking their smart watch while jogging, warm amber sunlight catching their face and highlighting the athletic textures of their clothing." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX1WLEvAALYEVmypuq3BuADEyHAqvZs-O3nmDeIlSI0teMZffIwb77cx-tYWUj5FRzicj8BL7tbLX2HUiAvjCkvnmoDDEWAu7Qg0JLkMVX0kbUnTdRookTRtP6GM7CcKAGGtTI_86-F9C5fpGaN5qyonlXbzYmilkR64kcwk6Ndyp4gtALvMnrEVA--rmPMqVNYuUdYf3uuGZha7B0AIlOLgzl6rs5L6CPy9mowB0vK51RiIkKqDJrOd30f7dadlN7ZZ5InhLLQARr"/>
</div>
</div>
</div>
</div>

<div className="relative z-20 h-full flex flex-col pointer-events-none">

<header className="flex justify-between items-center w-full sticky top-0 z-40 w-full top-0 px-container-padding pt-md pointer-events-auto">
<div className="glass-dark rounded-full px-sm py-xs flex items-center gap-sm">
<div onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer">
<img className="w-full h-full object-cover" alt="A professional, high-resolution student profile photo. A young adult with a friendly smile, dressed in a minimalist white t-shirt, set against a soft-focus architectural campus background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbKms6w_96CLS9108O3ANj2kK2EXSh9IU8VZ2DxG9QeuWnC0hgY6vdi3phRkIoz25VxNo1zy2S0MueAEPucjHbVO6ualH31P0HVoJO_LYKETwuXvSQULEAtuznK-1OqwmLf_SgNu_IUzLGhuMs9S9uw8R8hakPC4J3B2h6aZ5J9UDLu5ceUHNl-sccaWlUBXkqVxPThsuP8ukuUuYSMZi-qUXyzH0HhJ4eDhIBvTDKGKtm1SeFEfer-DjADuCv6bJnYBJKsKyoHIBK"/>
</div>
<div className="flex flex-col">
<span className="text-white font-label-sm leading-none opacity-60">Near</span>
<span className="text-white font-label-md leading-none">Main Quad</span>
</div>
</div>
<div className="glass-dark rounded-full px-sm py-xs flex items-center gap-xs">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container"></span>
</span>
<span className="text-white font-label-md">2 FitTrips nearby</span>
</div>
</header>
<main className="flex-1"></main>

<div className="px-container-padding pb-xl pointer-events-auto">

<div className="glass-dark rounded-[24px] p-md mb-md shadow-2xl flex flex-col gap-md">
<div className="flex justify-between items-center">
<div>
<h2 className="text-white font-title-md">Exploring North Loop</h2>
<p className="text-white/60 font-body-md">Quest active · North Loop</p>
</div>
<button onClick={() => navigate('/scan')} className="bg-tertiary text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
</button>
</div>
<div className="flex gap-xs">
<div className="bg-white/10 rounded-full px-sm py-xs flex items-center gap-xs">
<span className="material-symbols-outlined text-primary-fixed-dim text-sm">location_on</span>
<span className="text-white font-label-sm">80m to Next QR</span>
</div>
<div className="bg-white/10 rounded-full px-sm py-xs flex items-center gap-xs">
<span className="material-symbols-outlined text-tertiary-fixed-dim text-sm">groups</span>
<span className="text-white font-label-sm">3 Active Crews</span>
</div>
</div>
<button onClick={() => navigate('/scan')} className="w-full bg-tertiary hover:bg-tertiary/90 text-white font-label-md py-sm rounded-full transition-colors flex items-center justify-center gap-sm">
                    Interact with Nearby FitTrips
                </button>
</div>

</div>
</div>


    </>
  );
}
