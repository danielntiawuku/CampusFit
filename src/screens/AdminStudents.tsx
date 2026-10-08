import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Avatar, EmptyState, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchAllProfiles, updateProfileRole, updateProfileVerification } from '../lib/api';
import type { Profile } from '../lib/types';

export default function AdminStudents() {
  const navigate = useNavigate();
  useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    fetchAllProfiles()
      .then(data => {
        if (!cancelled) { setProfiles(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setLoading(false); setError('Could not load students.'); }
      });
    return () => { cancelled = true; };
  }, []);

  async function setRole(userId: string, role: 'student' | 'admin') {
    setSaving(userId);
    setError(null);
    try {
      await updateProfileRole(userId, role);
      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, role } : p)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update role.');
    } finally {
      setSaving(null);
    }
  }

  async function setVerification(userId: string, status: Profile['verification_status']) {
    setSaving(userId);
    setError(null);
    try {
      await updateProfileVerification(userId, status);
      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, verification_status: status } : p)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update verification.');
    } finally {
      setSaving(null);
    }
  }

  const students = profiles.filter(p => p.role === 'student');
  const admins = profiles.filter(p => p.role === 'admin');
  const unverified = students.filter(p => p.verification_status === 'unverified' || p.verification_status === 'pending');
  const verified = students.filter(p => p.verification_status === 'verified');
  const rejected = students.filter(p => p.verification_status === 'rejected');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verified; rejected;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Students"
        onBack={() => navigate('/admin')}
        right={
          <span className="rounded-full bg-tertiary-container px-3 py-1 font-label-sm text-label-sm text-on-tertiary-container">
            admin
          </span>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {error && <Alert kind="error">{error}</Alert>}

        {/* summary */}
        <div className="grid grid-cols-4 gap-card-gap">
          <div className="card p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Total users</p>
            <p className="font-title-md text-title-md font-bold">{profiles.length}</p>
          </div>
          <div className="card p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Students</p>
            <p className="font-title-md text-title-md font-bold text-primary">{students.length}</p>
          </div>
          <div className="card p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Admins</p>
            <p className="font-title-md text-title-md font-bold text-secondary">{admins.length}</p>
          </div>
          <div className="card p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Pending verification</p>
            <p className="font-title-md text-title-md font-bold text-error">{unverified.length}</p>
          </div>
        </div>

        {/* pending verification */}
        {unverified.length > 0 && (
          <section className="space-y-md">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md text-error">Pending verification</h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{unverified.length} students</span>
            </div>
            <div className="space-y-sm">
              {unverified.map(u => (
                <div key={u.id} className="card p-md">
                  <div className="flex items-center gap-md">
                    <Avatar name={u.full_name || 'Student'} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        {u.full_name || 'Unnamed student'}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{u.email}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Status: {u.verification_status} · joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <button
                        type="button"
                        onClick={() => setVerification(u.id, 'verified')}
                        disabled={saving === u.id}
                        className="chip bg-primary-container text-on-primary-container"
                      >
                        {saving === u.id ? 'Saving…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerification(u.id, 'rejected')}
                        disabled={saving === u.id}
                        className="chip bg-error-container text-error"
                      >
                        Reject
                      </button>
                      {u.role === 'admin' ? (
                        <span className="chip bg-tertiary-container text-on-tertiary-container">Admin</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRole(u.id, 'admin')}
                          disabled={saving === u.id}
                          className="chip"
                        >
                          Make admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* all students */}
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md">All students</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{students.length} students</span>
          </div>
          {loading ? (
            <div className="space-y-sm">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-card" />)}
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon="school"
              title="No students"
              message="Students appear here once they sign up."
            />
          ) : (
            <div className="space-y-sm">
              {students.map(u => (
                <div key={u.id} className="card p-md">
                  <div className="flex items-center gap-md">
                    <Avatar name={u.full_name || 'Student'} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-sm">
                        <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                          {u.full_name || 'Unnamed student'}
                        </p>
                        {u.verification_status === 'verified' ? (
                          <span className="chip bg-primary-container text-on-primary-container text-[11px]">Verified</span>
                        ) : u.verification_status === 'rejected' ? (
                          <span className="chip bg-error-container text-error text-[11px]">Rejected</span>
                        ) : (
                          <span className="chip text-[11px]">{u.verification_status}</span>
                        )}
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{u.email}</p>
                      <div className="flex items-center gap-sm mt-xs">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {u.points.toLocaleString()} pts · Level {u.level}
                        </span>
                        <span className="text-on-surface-variant">·</span>
                        <span className="font-label-sm text-label-sm text-error">{u.streak_days} day streak</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      {u.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => setRole(u.id, 'student')}
                          disabled={saving === u.id}
                          className="chip bg-error-container text-error text-[11px]"
                        >
                          {saving === u.id ? 'Saving…' : 'Remove admin'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRole(u.id, 'admin')}
                          disabled={saving === u.id}
                          className="chip text-[11px]"
                        >
                          {saving === u.id ? 'Saving…' : 'Make admin'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setVerification(u.id, 'verified')}
                        disabled={saving === u.id || u.verification_status === 'verified'}
                        className="chip bg-primary-container text-on-primary-container text-[11px]"
                      >
                        {saving === u.id ? 'Saving…' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* admins */}
        {admins.length > 0 && (
          <section className="space-y-md">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md">Administrators</h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{admins.length} admins</span>
            </div>
            <div className="space-y-sm">
              {admins.map(a => (
                <div key={a.id} className="card p-md">
                  <div className="flex items-center gap-md">
                    <Avatar name={a.full_name || 'Admin'} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        {a.full_name || 'Admin'}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{a.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRole(a.id, 'student')}
                      disabled={saving === a.id}
                      className="chip bg-error-container text-error text-[11px]"
                    >
                      {saving === a.id ? 'Saving…' : 'Remove admin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* info card */}
        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-md">
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">What you can do here</p>
          <ul className="mt-sm space-y-xs">
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Approve or reject student verification requests.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">role</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Promote a student to admin, or demote an admin back to student.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">person</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">See each student's points, level, streak and verification status.</p>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
