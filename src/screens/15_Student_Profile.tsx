/* eslint-disable */
/**
 * Screen 15 — Student Profile
 * Ported verbatim from the Google Stitch export
 * (_campusfit_screens/15_Student_Profile.html); interactivity is wired to the app
 * (routing, auth, gamification data) in App/routes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboard } from '../lib/api';

export default function Stitch15_Student_Profile() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(rows => {
        const mine = rows.find(row => row.user_id === profile?.id);
        setRank(mine?.rank ?? null);
      })
      .catch(() => setRank(null));
  }, [profile]);

  const name = profile?.full_name ?? 'Jordan Smith';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('') || 'JS';
  return (
    <>


<header className="w-full top-0 sticky z-40 bg-background/80 backdrop-blur-md flex items-center justify-between px-container-padding py-xs">
<div className="flex items-center gap-md">
<span onClick={() => navigate('/home')} className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform cursor-pointer">menu</span>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Profile</h1>
<div className="flex items-center gap-md">
<span onClick={() => navigate('/settings')} className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform cursor-pointer">settings</span>
</div>
</header>
<main className="px-container-padding pt-md space-y-xl">

<section className="flex flex-col items-center text-center">
<div className="relative mb-md">
<div onClick={() => navigate('/edit-profile')} className="w-24 h-24 rounded-full bg-primary-container border-4 border-surface-container-lowest flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform">
<span className="font-display-lg text-display-lg text-white">{initials}</span>
</div>
<div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-outline-variant">
<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
</div>
</div>
<h2 className="font-title-md text-title-md text-on-background">{name}</h2>
<p className="text-on-surface-variant font-label-md text-label-md mb-sm">Varsity Run Club · Year 3</p>

<div className="flex gap-xs justify-center">
<span className="flex items-center gap-xs px-sm py-xs bg-secondary-container/20 rounded-full border border-secondary-container/30">
<span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
<span className="font-label-sm text-label-sm text-secondary">{profile?.streak_days ?? 12} Day Streak</span>
</span>
<span className="flex items-center gap-xs px-sm py-xs bg-tertiary-container/20 rounded-full border border-tertiary-container/30">
<span className="material-symbols-outlined text-[14px] text-tertiary">military_tech</span>
<span className="font-label-sm text-label-sm text-tertiary">Rank #{rank ?? '—'}</span>
</span>
</div>
</section>

<section className="grid grid-cols-3 gap-sm">
<div className="bg-surface-container-lowest border border-black/5 rounded-2xl p-sm flex flex-col items-center text-center">
<span className="font-title-md text-title-md text-primary">24</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">routes done</span>
</div>
<div className="bg-surface-container-lowest border border-black/5 rounded-2xl p-sm flex flex-col items-center text-center">
<span className="font-title-md text-title-md text-secondary">112</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">km total</span>
</div>
<div className="bg-surface-container-lowest border border-black/5 rounded-2xl p-sm flex flex-col items-center text-center">
<span className="font-title-md text-title-md text-tertiary">{profile?.level ?? 6}</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">level</span>
</div>
</section>

<section className="bg-surface-container-lowest border border-black/5 rounded-3xl p-lg space-y-md">
<div className="flex justify-between items-start">
<div>
<h3 className="font-title-md text-title-md text-on-background">Varsity Run Club</h3>
<span className="inline-block mt-xs px-xs py-1 bg-primary/10 text-primary rounded font-label-sm text-label-sm">Primary Club</span>
</div>
<div className="flex -space-x-2">
<img className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="A close-up high-quality portrait of a smiling female college student with an athletic aesthetic, soft outdoor lighting in a university campus park, warm cream tones, professional minimalist photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Qdhay8VrWzbynIVHDR1usmwoS_nmHMnd9qWzdsdJziOKHLFN5aiPdBRaYBzXlRg2xROmyjcD2peO31XYZzqDrgKCwmMG9ywa7rjC_out907v35C-L7fpxN5411ctApnGcyz_nOo-g8jnwtcRdZOpMQhxoByoVBD3GxmsrkSrulAXVq97Rm6QBveOeBxkJro14vVmv-D9-rebQXi237lWaSg-wkmKt2u0q-cNRVuC4g8v7s4hpRN99sLG44iNHDoKSPEi6t2Xo1lO"/>
<img className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="A focused male student-athlete wearing high-performance running gear, bright daylight, vibrant green university athletic track background, shallow depth of field, minimalist clean composition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYgXd3bEyr36BJOeJzyhAelaVRpuJQlPldN6Y1LHLWS7JR_wi4z6Lj8V5OpoVm_13emRcAXtcyUJyRaKSbMsIVfdWTzSMhvphysgjCdund6TI00-27so7H8T9qIycv25mgPf9puwV8WG_NsUQdpnvz9TNvWPtNImRcyYgTc3HNWx2NHG2OF7VlXqezWsDArkMoZlOSe2-Py499m18Gwo3p2U5OSbr_QYedi3JLNgwJwGrmTx7vqAxhwYKDb1jtt4mzDu58QNe6Ma8i"/>
<img className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Portrait of a young diverse student wearing a tech-focused fitness tracker, bright and warm minimalist indoor gym setting, soft shadows, high-key lighting, mint and cream color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5VrD7lCiXyMGz4XbOMFuqwLkb1Lzs-OCLfAYfvn-VQSyaX8R_nvLXjz-atyNGuUHsiZ_hIl-ntYvl4JfbRoQ70FAAfTif--6WOAvJqz2EBQgxsmaBcQ7BymuszQ8-nl08-QQmtnMrS3wSL7VaID5GXPbPfkPHQ3A71MwqHsk3jBouEqVRtRLfH4Bzz37GWSvGBQ-Omgm9Ig6T3NGnfRDZVgcLB18RBBoeh4mR_bWH0pgJthPzUda5rczait_OO5qEWBk7OXS4GCmn"/>
<div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center">
<span className="text-[10px] font-bold text-on-surface-variant">+42</span>
</div>
</div>
</div>
<div className="flex items-center gap-xl py-sm border-y border-outline-variant/30">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant">Active Members</span>
<span className="font-body-lg text-body-lg font-bold">156</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant">Leaderboard</span>
<span className="font-body-lg text-body-lg font-bold text-secondary">3rd Place</span>
</div>
</div>
<button onClick={() => navigate('/clubs')} className="flex items-center gap-xs font-label-md text-label-md text-primary font-bold hover:opacity-80 transition-all">
        View club dashboard
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</section>

<section className="space-y-md">
<div className="flex justify-between items-center">
<div className="flex items-center gap-sm">
<button onClick={() => navigate('/record')} aria-label="Record a FitClip" className="grid h-8 w-8 place-items-center rounded-full bg-primary-container/15 text-primary transition active:scale-90">
<span className="material-symbols-outlined text-[20px]">add</span>
</button>
<button onClick={() => navigate('/clips')} className="flex items-center gap-xs">
<h3 className="font-title-md text-title-md text-on-background">My FitClips</h3>
<span className="material-symbols-outlined text-on-surface-variant">grid_view</span>
</button>
</div>
</div>
<div onClick={() => navigate('/clips')} className="grid grid-cols-3 gap-base cursor-pointer">

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="A dynamic action shot from a first-person perspective of a morning run through a sun-drenched university campus, warm golden hour lighting, cinematic motion blur, deep charcoal and vibrant green highlights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgcegqjCX95emYYGSvbnbNQIM9schRIdlDORJZodfQk4AXmDBMW7nb3JMxGN0h9rrk1wNRIsItJUjpRs9MPM4H98MuVk4ZVX_NfxKqqrMerF6NP9l49cQTJzQoqDj-YMbZfTG8JQRHNEc6Mqz8NKXHcWEC--aVdenA3W6ufw9LbPnjaE_PWfdr2NeV19c-05R-4lIbaBDDcJa34JFH3QNpD7d3VNojiiM98B1h5OM4sOLdRfFIJ7ILxFE0DxyoIWXik_Wesv1e_WSD"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="A stylized overhead view of colorful yoga mats arranged in a minimalist university hall, soft diffuse lighting, warm cream background with mint green accents, high-quality digital aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9NT5H3nt0KkSC0Lj1kXo_XwMw-3mpOgh7y71NExjq0hWZan_TP-qlujlvAi-CuXGiok-mMJ3HSL7hIBzpGnTV08--bI_b02JdDZuAVsb5eoZ0fDvie8WaZguAVrVSrsYeT763e3BfiCqFl1l-bf2-oOiXCtjdF3isFpRLP4B4fGGd4ZW6gYXZahSkhZoRlriYtASyiwm4ZDH48HKue8rhXIf3wL4ioOmfAD8HFpB9rI85VjLIm8P_3T5GHHe-qdKWMYzwqWzJaleG"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="A close-up of high-performance sneakers on a textured dark asphalt path with a painted white line, dramatic side lighting, minimalist athletic vibe, deep charcoal and crisp white palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_SACt0npmD4Kmhv_tlmnRhOtjBigUFHXD4Grb2aX13oFR6LFa4R4zbMjfvx3XifZUYA06paOtWYszXj2JVnjL8IfqDDAhvgxn2M0NR2_6HU4mVEYw0KBKqcf9NwzK3pxfxFeqSYcYdA7ay8Pul75fOUN2J5BD5BW9C3DCzXcG06YdtKnONRgz4V9hqusMT_utdNJxeGR95j3zqJdPn3khCpH0a2g50s4G-46ujDMbo0AZ822YNR5Gyn0B7JwdoV0j-vLDyGwb_1MU"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="An artistic blurred shot of a student cyclist moving through a modern campus archway, lens flare, bright high-key lighting, professional minimalist sport photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeLGyRS10KpDCt-tOFc0nVGyVosJaipeQmySquhcLuzGDQ1KnWI60lSnHRAPTmmc_dPW2qkmzQlkPu-wjHRtZMy6nNjnkL6nS-PIxI1-mxoSGPSGNG0tIqjFnmSremhgEw6GoyslMYLqcOQlh9DFANM9TQWL-eTmG1Q7TRdnUTJfR3_5YvbVMpTysE-UiDTaWTl9ilaG37tgidWnDWNkt6TiSKYZ7ZqPOSFjEcGu-vX3j0fYctN9rVS_zBa8UVAwKu6SqOn0dZodzL"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="A minimalist capture of a heart-rate monitor display glowing in a dark gym environment, neon mint green line on a deep charcoal screen, futuristic fitness tech aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXA5dB49bEVBTVFMBJslffBvo357vbo3s4iXvpC8outMG0aw_Mvamo0TxSg48YFhVl1DrrMmh30wIwmfT08A2W6ciDxWFIshw_DnyWq35HTNrtNWpaT0AhrOWGRs1LtDqtrlVdSrtLu1JVaYkrVexkp02uc99umOs85YZ033xe3hDHkjrO4WtCA3Q2ScYTnc6IWwmoFCQksQDpK3OPVZWjCmLzadRGzk7eZhhCvdY_5HTLv6MYhtjY2nsxDZg5HMJJXdhwM3eCIJf1"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>

<div className="aspect-square bg-inverse-surface rounded-lg relative overflow-hidden group cursor-pointer">
<img className="w-full h-full object-cover opacity-60" alt="A serene wide shot of a university courtyard at dawn with mist and soft purple sky, minimalist tranquil campus setting, high-end photography mood, professional digital art." src="https://lh3.googleusercontent.com/aida-public/AB6AXuADKRjndwV5QDyonljo1mFCWX32bknovwJnd4hxAuFFXxBU93jgQrstXFwhvqAfnqo3Csg9Q0ly7xAkjbTQcdcUqn7ArqjA4avBnC6gQA2Bal5YuyPs5367mx5lrkO01csVMXBhjh5zApkj1Mny7ZkOVYRgtzBPSpcezHCfsYfFlErJFpf4Uy_WHxwf0onFgEHn_nj_Rkuer-zA2BsKh1dsUw-MG4bSPWjrOqk1YJgoKLEtesYloFsCzcWlcb78ixPCRS7Y5fOtKtQJ"/>
<div className="absolute inset-0 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[32px] opacity-80 group-active:scale-90 transition-transform">play_circle</span>
</div>
</div>
</div>
</section>
</main>


    </>
  );
}
