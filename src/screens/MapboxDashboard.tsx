import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchCheckpoints } from '../lib/api';
import type { Checkpoint } from '../lib/types';

export default function MapboxDashboard() {
  const navigate = useNavigate();
  useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<import('mapbox-gl').Marker[]>([]);

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);  const [selected, setSelected] = useState<Checkpoint | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const token = mapboxToken ?? ''
  const [mapError, setMapError] = useState<string | null>(null);

  // Pull the Mapbox token from env (build-time) so the map renders in production.
  // VITE_MAPBOX_TOKEN is optional — without it the map shows a helpful placeholder.

  useEffect(() => {
    let cancelled = false;
    fetchCheckpoints()
      .then(data => {
        if (!cancelled) { setCheckpoints(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Initialize Mapbox when we have checkpoints + token + container.
  useEffect(() => {
    if (!mapContainer.current || !token || loading) return;
    if (map.current) {
      // markers already rendered on reload; just re-attach them.
      return;
    }

    const init = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');

        mapboxgl.accessToken = token;
        const m = new mapboxgl.Map({
          container: mapContainer.current!,
          // A stock Mapbox style (the previous custom style id returned 404).
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [-0.1848, 5.6116], // University of Ghana, Legon (lon, lat)
          zoom: 15.5,
          attributionControl: false,
        });

        m.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-right');          m.addControl(new mapboxgl.NavigationControl(), 'top-right');

          m.on('load', () => {
            map.current = m;
            setMapError(null);
          });
          m.on('error', () => { setMapError('Map failed to load. Check your Mapbox token.'); });
        } catch {
          setMapError('Could not load the map. Check VITE_MAPBOX_TOKEN.');
        }
      };

      init();
    }, [token, loading]);

  // Re-render markers whenever checkpoints + map are ready.
  useEffect(() => {
    if (!map.current || loading) return;
    markers.current.forEach(m => m.remove());
    markers.current = [];

    checkpoints.forEach(cp => {
      if (cp.latitude == null || cp.longitude == null) return;
      const el = document.createElement('div');
      el.className = 'checkpoint-marker';
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: ${cp.is_active ? '#1ecc8b' : '#b0aec0'}; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700; cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid #fff;
        transition: transform 0.15s ease;
      `;
      el.textContent = String(cp.base_points);
      el.title = `${cp.name} · ${cp.code}`;

      el.addEventListener('click', () => {
        setSelected(cp);
        if (map.current) {
          map.current.flyTo({ center: [cp.longitude ?? 0, cp.latitude ?? 0], zoom: 17, duration: 800 });
        }
      });

      const marker = new (window as unknown as { mapboxgl: typeof import('mapbox-gl') }).mapboxgl.Marker({ element: el })
        .setLngLat([cp.longitude ?? 0, cp.latitude ?? 0])
        .addTo(map.current!);
      markers.current.push(marker);
    });
  }, [checkpoints, loading]);

  function handleScanNearby() {
    if (!selected) {
      navigate('/scan');
      return;
    }
    navigate(`/scan?code=${String(selected.code)}`);
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Campus Map"
        onBack={() => navigate('/explore')}
        right={
          <button
            type="button"
            onClick={() => navigate('/scan')}
            aria-label="Scan checkpoint"
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary-container transition hover:opacity-90 active:scale-95 shadow-md"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
          </button>
        }
      />

      <main className="flex-1 relative pb-24">
        {/* map container */}
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* loading / error overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 bg-brand-ink/60 flex items-center justify-center">
            <div className="text-center text-white">
              <span className="material-symbols-outlined text-5xl mb-sm animate-spin">map</span>
              <p className="font-label-md text-label-md mt-xs">Loading campus map…</p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 z-10 bg-brand-ink/90 flex flex-col items-center justify-center p-md text-center text-white">
            <span className="material-symbols-outlined text-5xl mb-sm">warning</span>
            <p className="font-title-md text-title-md mb-xs">Map unavailable</p>
            <p className="font-label-md text-label-md text-white/70 max-w-xs">
              {mapError}
            </p>
            <div className="mt-md flex gap-sm">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="btn-primary"
              >
                Scan a checkpoint
              </button>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="btn-ghost"
              >
                Back to routes
              </button>
            </div>
          </div>
        )}

        {/* no-token hint */}
        {!token && !loading && (
          <div className="absolute inset-0 z-10 bg-brand-ink/90 flex flex-col items-center justify-center p-md text-center text-white">
            <span className="material-symbols-outlined text-5xl mb-sm">map</span>
            <p className="font-title-md text-title-md mb-xs">Add a Mapbox token</p>
            <p className="font-label-md text-label-md text-white/70 max-w-xs mb-md">
              Set <code>VITE_MAPBOX_TOKEN</code> in your Vercel environment variables to show the live campus map.
              For now you can still scan checkpoints and view routes.
            </p>
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="btn-primary"
              >
                Scan a checkpoint
              </button>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="btn-ghost"
              >
                Back to routes
              </button>
            </div>
          </div>
        )}

        {/* bottom info card + scan button */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-outline-variant/30 px-container-padding py-md space-y-md">
          {selected && (
            <div className="flex items-start gap-md">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold shrink-0">
                {selected.base_points}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label-md text-label-md font-semibold text-on-surface truncate">{selected.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {selected.location} · {selected.code} · {selected.difficulty} · {selected.base_points} pts
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="flex-1 h-12 bg-primary text-on-primary rounded-full font-label-md text-label-md shadow-md transition active:scale-95 flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
              Scan checkpoint
            </button>
            <button
              type="button"
              onClick={handleScanNearby}
              disabled={!selected}
              className="h-12 w-12 rounded-full bg-primary-container text-primary flex items-center justify-center transition disabled:opacity-40 active:scale-95"
              aria-label="Scan selected"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </button>
          </div>

          <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
            {checkpoints.filter(c => c.is_active).length} active checkpoints shown
          </p>
        </div>
      </main>
    </div>
  );
}
