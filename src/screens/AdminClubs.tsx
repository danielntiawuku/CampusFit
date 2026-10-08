import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, EmptyState, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchClubs, createClub, deleteClub } from '../lib/api';
import type { Club } from '../lib/types';

const CLUB_COLORS = [
  '#1ecc8b', '#2E7D32', '#006c47', '#388e3c',
  '#e67e22', '#c0392b', '#8e44ad', '#2c3e50',
  '#f1c40f', '#16a085', '#27ae60', '#d35400',
];

export default function AdminClubs() {
  const navigate = useNavigate();
  useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: CLUB_COLORS[0],
  });

  useEffect(() => {
    let cancelled = false;
    fetchClubs()
      .then(data => {
        if (!cancelled) { setClubs(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function resetForm() {
    setForm({ name: '', description: '', color: CLUB_COLORS[0] });
    setError(null);
  }

  async function submitForm() {
    if (!form.name.trim()) {
      setError('Club name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const existing = clubs.find(c => c.name.toLowerCase() === form.name.trim().toLowerCase());
      if (existing) {
        setError('A club with this name already exists.');
        return;
      }
      await createClub({
        name: form.name.trim(),
        description: form.description.trim() || null,
        color: form.color,
      });
      const fresh = await fetchClubs();
      setClubs(fresh);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create club.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this club? Members will be unlinked.')) return;
    setDeleting(id);
    try {
      await deleteClub(id);
      const fresh = await fetchClubs();
      setClubs(fresh);
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Clubs"
        onBack={() => navigate('/admin')}
        right={
          <span className="rounded-full bg-tertiary-container px-3 py-1 font-label-sm text-label-sm text-on-tertiary-container">
            admin
          </span>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {/* add club form */}
        <div className="rounded-card border border-primary/20 bg-primary-container/5 p-lg">
          <div className="mb-md">
            <h3 className="font-title-md text-title-md text-primary">Add club</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Clubs are how students group up for challenges.
            </p>
          </div>

          <div className="space-y-xs">
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Club name</label>
              <input
                type="text"
                className="field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="North Loop Crew"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Description</label>
              <input
                type="text"
                className="field"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Morning runs around the north quad."
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Club color</label>
              <div className="flex gap-xs flex-wrap">
                {CLUB_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
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
                {submitting ? 'Adding…' : 'Add club'}
              </button>
            </div>
          </div>
        </div>

        {/* clubs list */}
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">All clubs</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {clubs.length} clubs
            </span>
          </div>

          {loading ? (
            <div className="space-y-sm">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-card" />)}
            </div>
          ) : clubs.length === 0 ? (
            <EmptyState
              icon="groups"
              title="No clubs"
              message="Create the first club for students to join."
            />
          ) : (
            <div className="space-y-sm">
              {clubs.map(club => (
                <div key={club.id} className="card p-md">
                  <div className="flex items-center gap-md">
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: club.color }}
                    >
                      {club.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md font-semibold text-on-surface">{club.name}</p>
                      {club.description && (
                        <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                          {club.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {club.member_count} members
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(club.id)}
                        disabled={deleting === club.id}
                        className="text-label-sm text-error hover:underline"
                      >
                        {deleting === club.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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
