import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Icon, DifficultyPill, EmptyState, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  fetchCheckpoints,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
} from '../lib/api';
import type { Checkpoint, CheckpointDifficulty } from '../lib/types';

const DIFFICULTIES: { value: CheckpointDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'epic', label: 'Epic' },
];

const LOCATIONS = [
  'University Library',
  'Student Rec Centre',
  'North Quadrangle',
  'Main Cafeteria',
  'University Centre',
  'Sports Stadium',
  'Science Block',
  'Engineering Bridge',
  'Campus Medical Centre',
  'Aquatics Centre',
  'Transport Yard',
  'Botanic Garden',
  'Hall A',
  'Observatory Hill',
  'West Residences',
  'Performing Arts Theatre',
  'South Fields',
  'Campus Lake',
  'Western Ridge',
  'Arts Dome',
];
export default function AdminCheckpoints() {
  const navigate = useNavigate();
  useAuth();

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    location: LOCATIONS[0],
    difficulty: 'easy' as CheckpointDifficulty,
    base_points: 10,
    latitude: 5.6116,
    longitude: -0.1848,
    is_active: true,
  });

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

  function resetForm() {
    setForm({
      name: '',
      code: '',
      description: '',
      location: LOCATIONS[0],
      difficulty: 'easy',
      base_points: 10,
      latitude: 5.6116,
      longitude: -0.1848,
      is_active: true,
    });
    setError(null);
  }

  async function submitForm() {
    if (!form.name.trim() || !form.code.trim()) {
      setError('Name and code are required.');
      return;
    }
    if (!/^[A-Z0-9][A-Z0-9\-_ ]*$/.test(form.code.trim().toUpperCase())) {
      setError('Code must be uppercase letters, numbers, hyphens or underscores.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        location: form.location,
        difficulty: form.difficulty,
        base_points: Math.max(5, Math.min(100, form.base_points)),
        latitude: form.latitude,
        longitude: form.longitude,
        is_active: form.is_active,
      };
      const created = await createCheckpoint(payload);
      if (created) {
        setCheckpoints(prev => [...prev, created]);
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create checkpoint.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await updateCheckpoint(id, { is_active: !current });
      setCheckpoints(prev =>
        prev.map(c => c.id === id ? { ...c, is_active: !current } : c)
      );
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this checkpoint? Students will no longer be able to scan it.')) return;
    setDeleting(id);
    try {
      await deleteCheckpoint(id);
      setCheckpoints(prev => prev.filter(c => c.id !== id));
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }

  function generateQRCodeURL(code: string) {
    // Use a public QR API so the admin can download a printable QR.
    const encoded = encodeURIComponent(code.trim().toUpperCase());
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&color=0D7377&bgcolor=ffffff`;
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Checkpoints"
        onBack={() => navigate('/admin')}
        right={
          <span className="rounded-full bg-tertiary-container px-3 py-1 font-label-sm text-label-sm text-on-tertiary-container">
            admin
          </span>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {/* add checkpoint form */}
        <div className="rounded-card border border-primary/20 bg-primary-container/5 p-lg">
          <div className="flex items-center justify-between mb-md">
            <div>
              <h3 className="font-title-md text-title-md text-primary">Add checkpoint</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Print the QR code and paste it at the physical location.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-xs">
            <div className="flex gap-sm">
              <div className="flex-1 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Checkpoint name</label>
                <input
                  type="text"
                  className="field"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Main Library Steps"
                />
              </div>
              <div className="w-28 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Code</label>
                <input
                  type="text"
                  className="field font-mono text-sm"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="LIB-A1"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Description</label>
              <input
                type="text"
                className="field"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Climb the front steps of the main library."
              />
            </div>

            <div className="flex gap-sm">
              <div className="flex-1 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Location</label>
                <select
                  className="field appearance-none"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="w-28 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Difficulty</label>
                <select
                  className="field appearance-none"
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as CheckpointDifficulty }))}
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Base pts</label>
                <input
                  type="number"
                  className="field"
                  min={5}
                  max={100}
                  value={form.base_points}
                  onChange={e => setForm(f => ({ ...f, base_points: Math.max(5, Number(e.target.value) || 5) }))}
                />
              </div>
            </div>

            <div className="flex gap-sm">
              <div className="w-28 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="field font-mono text-sm"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="w-28 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="field font-mono text-sm"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex-1 space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Active</label>
                <label className="flex items-center gap-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="accent-primary"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Students can scan this</span>
                </label>
              </div>
            </div>

            {error && <Alert>{error}</Alert>}

            <div className="flex gap-sm pt-sm">
              <button
                type="button"
                onClick={submitForm}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Adding…' : 'Add checkpoint'}
              </button>
            </div>
          </div>
        </div>

        {/* QR code generator for a code */}
        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-lg">
          <div className="flex items-center justify-between mb-md">
            <div>
              <h3 className="font-title-md text-title-md">Download QR codes</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Generate a printable QR for any checkpoint code.
              </p>
            </div>
          </div>

          <div className="flex gap-sm">
            <input
              type="text"
              className="field flex-1 font-mono"
              placeholder="e.g. LIB-A1"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
            <button
              type="button"
              onClick={() => {
                // trigger the print-ready QR preview below
              }}
              className="btn-ghost"
              disabled={!form.code.trim()}
            >
              Preview
            </button>
          </div>

          {form.code.trim() && (
            <div className="mt-md flex items-center gap-lg flex-wrap">
              <a
                href={generateQRCodeURL(form.code)}
                download={`checkpoint-${form.code.trim().toUpperCase()}.png`}
                className="flex items-center gap-sm card p-md cursor-pointer transition hover:shadow-card"
              >
                <img
                  src={generateQRCodeURL(form.code)}
                  alt={`QR code for ${form.code}`}
                  className="w-20 h-20"
                />
                <div>
                  <p className="font-label-md text-label-md font-semibold">{form.code.trim().toUpperCase()}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Click to download PNG</p>
                </div>
              </a>
              <button
                type="button"
                onClick={() => {
                  const win = window.open(generateQRCodeURL(form.code), '_blank');
                  setTimeout(() => {
                    if (win?.document) {
                      win.document.write(`<html><head><title>QR ${form.code}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#fff;height:100vh;"><img src="${generateQRCodeURL(form.code)}" style="max-width:90vw;"/></body></html>`);
                      win.document.close();
                      win.print();
                    }
                  }, 400);
                }}
                className="btn-ghost flex items-center gap-sm"
                disabled={!form.code.trim()}
              >
                <Icon name="print" size={18} />
                Print
              </button>
            </div>
          )}

          {!form.code.trim() && (
            <div className="mt-md rounded-card bg-surface-container border border-outline-variant/30 p-md text-center">
              <Icon name="qr_code_scanner" size={40} className="mx-auto text-on-surface-variant mb-sm" />
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Enter a checkpoint code above to preview and download its QR code.
              </p>
            </div>
          )}
        </div>

        {/* checkpoints list */}
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">All checkpoints</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {checkpoints.filter(c => c.is_active).length} active · {checkpoints.length} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-sm">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-20 rounded-card" />)}
            </div>
          ) : checkpoints.length === 0 ? (
            <EmptyState
              icon="location_on"
              title="No checkpoints"
              message="Add your first checkpoint using the form above."
            />
          ) : (
            <div className="space-y-sm">
              {checkpoints.map(cp => (
                <div key={cp.id} className="card p-md">
                  <div className="flex items-start gap-md">
                    <DifficultyPill level={cp.difficulty} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-sm">
                        <div>
                          <p className="font-label-md text-label-md font-semibold text-on-surface">{cp.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{cp.location}</p>
                        </div>
                        <span className="font-mono text-[13px] text-primary font-semibold bg-primary-container/10 px-sm py-xs rounded-full">
                          {cp.code}
                        </span>
                      </div>
                      {cp.description && (
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs truncate">
                          {cp.description}
                        </p>
                      )}
                      <div className="flex items-center gap-sm mt-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {cp.base_points} base pts
                        </span>
                        <span className="text-on-surface-variant">·</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {cp.latitude?.toFixed(4)}, {cp.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <button
                        type="button"
                        onClick={() => toggleActive(cp.id, cp.is_active)}
                        className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {cp.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cp.id)}
                        disabled={deleting === cp.id}
                        className="text-label-sm text-error hover:underline"
                      >
                        {deleting === cp.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  {/* inline QR preview */}
                  <div className="mt-md flex items-center gap-lg flex-wrap pt-sm border-t border-outline-variant/30">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">QR preview:</span>
                    <a
                      href={generateQRCodeURL(cp.code)}
                      download={`checkpoint-${cp.code}.png`}
                      className="flex items-center gap-sm card p-sm cursor-pointer transition hover:shadow-card"
                    >
                      <img
                        src={generateQRCodeURL(cp.code)}
                        alt={`QR for ${cp.code}`}
                        className="w-12 h-12"
                      />
                      <span className="font-label-sm text-label-sm text-primary">Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
